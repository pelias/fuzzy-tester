/**
 * @file A terminal output generator for test-suites results.
 */

'use strict';

var util = require( 'util' );

/**
 * Format and print a test result to the terminal.
 */
function prettyPrintResult( result ){
  var id = result.testCase.id;
  var input = JSON.stringify(result.testCase.in);
  var status = (result.progress === undefined) ? '' : result.progress.inverse + ' ';
  switch( result.result ){
    case 'pass':
      var output = util.format( '  ✔ %s[%s] "%s"', status, id, input ).green;
      console.log( output );
      break;

    case 'fail':
      var color = (result.progress === 'regression') ? 'red' : 'yellow';
      var output = util.format( '  ✘ %s[%s] "%s": %s', status, id, input, result.msg )[ color ];
      console.error( output );
      break;

    case 'placeholder':
      var output = util.format( '  ! [%s] "%s": %s', id, input, result.msg ).cyan;
      console.error( output );
      break;

    default:
      var output = util.format( 'Result type `%s` not recognized.', result.result );
      console.error( output );
      process.exit( 1 );
      break;
  }

  return output;
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults ){
  console.log( 'Tests for:', suiteResults.stats.url.blue );
  suiteResults.results.forEach( function ( suiteResult ){
    console.log( '\n' + suiteResult.stats.name.blue );
    suiteResult.results.forEach( function ( testResult ){
      prettyPrintResult( testResult );
    });
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.error( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.error( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numRegressions = suiteResults.stats.regression;
  var regressionsColor = ( numRegressions > 0 ) ? 'red' : 'yellow';
  console.log( 'Regressions: ' + numRegressions.toString()[ regressionsColor ] );
  console.log( 'Took %sms', suiteResults.stats.timeTaken );

  console.log( '' );
  if( numRegressions > 0 ){
    console.error( 'FATAL ERROR: %s regression(s) detected.'.red.inverse, numRegressions );
    process.exit( 1 );
  }
  else {
    console.log( '0 regressions detected. All good.' );
  }
}

module.exports = prettyPrintSuiteResults;
