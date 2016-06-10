var fs = require( 'fs' );
var path = require( 'path' );

var handlebars = require( 'handlebars' );
var juice = require( 'juice' );

var formatTestCase = require('./format_test_case');

function generateEmailBody(suiteResults, config, testSuites) {
  handlebars.registerHelper( 'json', JSON.stringify );
  handlebars.registerHelper( 'testCase', formatTestCase );

  var templateParams = { suiteResults: suiteResults, config: config, testSuites: testSuites };

  testSuites.forEach(function(suite) {
    suite.tests.forEach(function(testCase) {
      testCase.result = testCase.results[testCase.full_url];
    });
  });

  var templatePath = path.join( __dirname, '../../output_generators/email_static/email.html' );
  var emailTemplate = fs.readFileSync( templatePath ).toString();
  return juice( handlebars.compile( emailTemplate )( templateParams ) );
}

module.exports = generateEmailBody;
