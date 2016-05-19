var fs = require( 'fs' );
var path = require( 'path' );
var util = require( 'util' );

// add color methods to String.prototype
require( 'colors' );

var handlebars = require( 'handlebars' );
var nodemailer = require( 'nodemailer' );
var nodemailerSesTransport = require( 'nodemailer-ses-transport' );
var juice = require( 'juice' );
var peliasConfig = require( 'pelias-config' ).generate();
try {
  var emailConfig = peliasConfig[ 'acceptance-tests' ].email;
}
catch ( ex ) {
  console.error( ex );
  console.error( 'No email config present in your pelias-config!' );
  process.exit( 1 );
}

// replacer for stringifying testCase to avoid circular structure
function replace(key, value) {
  if (key === 'results' || key === 'result') {
    return undefined;
  }
  return value;
}

(function checkEmailConfig() {
  ['recipients'].forEach( function ( prop ) {
    if( !emailConfig.hasOwnProperty( prop )) {
      console.error( [
        'Your pelias-config\'s acceptance-tests.email object is missing one or more properties.',
        'Expected properties are:',
        '\trecipients: an array of recipients\'s mailing addresses.',
        '\tses: options for nodemailer-ses-transport, for Amazon\'s SES.'
      ].join( '\n' ) );
      process.exit( 1 );
    }
  });
})();

function formatTestCase( testCase ){
  var id = testCase.id;
  var input = JSON.stringify( testCase.in, undefined, 4 );
  var result = testCase.results[testCase.full_url];
  var status = (result.progress === undefined) ? '' :
    util.format( '<span class="status">%s</span> ', result.progress );

  var out;
  switch( result.result ){
    case 'pass':
      out = new handlebars.SafeString( util.format( '✔ %s[%s] "%s"', status, id, input ) );
      break;

    case 'fail':
      out = new handlebars.SafeString( util.format( '✘ %s[%s] "%s": %s', status, id, input, result.msg ) );
      break;

    case 'placeholder':
      return util.format( '! [%s] "%s": %s', id, input, result.msg );

    default:
      console.error( util.format( 'Result type `%s` not recognized.', result.result ) );
      process.exit( 1 );
  }

  return out;
}

function emailResults( suiteResults , config, testSuites ){
  handlebars.registerHelper( 'json', JSON.stringify );
  handlebars.registerHelper( 'testCase', formatTestCase );

  var templateParams = { suiteResults: suiteResults, config: config, testSuites: testSuites };

  testSuites.forEach(function(suite) {
    suite.tests.forEach(function(testCase) {
      testCase.result = testCase.results[testCase.full_url];
    });
  });

  var templatePath = path.join( __dirname, 'email_static/email.html' );
  var emailTemplate = fs.readFileSync( templatePath ).toString();
  var emailHtml = juice( handlebars.compile( emailTemplate )( templateParams ) );
  var transporter = nodemailer.createTransport( nodemailerSesTransport( emailConfig.ses ) );

  var emailOpts = {
    from: emailConfig.from || '"pelias-acceptance-tests" <noreply@pelias.mapzen.com>',
    to: emailConfig.recipients.join( ', ' ),
    subject: 'pelias acceptance-tests results ' + new Date().toString(),
    html: emailHtml,
    attachments: [{
      filename: 'results.json',
      content: JSON.stringify( suiteResults, replace, 4 )
    }]
  };

  transporter.sendMail( emailOpts, function( err, info ){
    if( err ){
      console.error( JSON.stringify( err, undefined, 4 ) );
    }
    else {
      console.log( 'Sent: ', JSON.stringify( info, undefined, 4 ) );
    }

    if( suiteResults.stats.regression > 0 ){
      return 1;
    }
    return 0;
  });
}

module.exports = emailResults;
