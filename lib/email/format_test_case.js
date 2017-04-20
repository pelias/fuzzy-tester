var util = require( 'util' );
var handlebars = require( 'handlebars' );

var testSuiteHelpers = require('../../lib/test_suite_helpers');

/*
 * Returns a string representation of the results of running a single
 * test case, suitable for display in an HTML email
 */
function formatTestCase( testCase ){
  var id = testCase.id;
  var input = JSON.stringify( testCase.in, undefined, 4 );
  var result = testSuiteHelpers.getMainResult(testCase);
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

module.exports = formatTestCase;
