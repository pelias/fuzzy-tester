// add color methods to String.prototype
require( 'colors' );

var nodemailer = require( 'nodemailer' );
var nodemailerSesTransport = require( 'nodemailer-ses-transport' );
var peliasConfig = require( 'pelias-config' ).generate();
var generateEmailBody = require('../lib/email/generate_email_body');

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

function getSubject(config) {
  return 'pelias ' + config.endpoint.name + ' acceptance-test results ' + new Date().toString();
}

function emailResults( suiteResults , config, testSuites ){
  var emailHtml = generateEmailBody( suiteResults, config, testSuites );
  var transporter = nodemailer.createTransport( nodemailerSesTransport( emailConfig.ses ) );

  var emailOpts = {
    from: emailConfig.from || '"pelias-acceptance-tests" <noreply@pelias.mapzen.com>',
    to: emailConfig.recipients.join( ', ' ),
    subject: getSubject(config),
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
