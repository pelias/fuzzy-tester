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
  var input = result.testCase.in.input;
  switch( result.result ){
    case 'pass':
      var output = util.format( '  ✔ [%s] "%s"', id, input ).green;
      console.log( output );
      break;

    case 'fail':
      var output = util.format( '  ✘ [%s] "%s": %s', id, input, result.msg ).red;
      console.error( output );
      break;

    case 'placeholder':
      var output = util.format( '  ! [%s] "%s": %s', id, input, result.msg ).yellow;
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
  console.log( 'Tests for:', suiteResults.stats.url.bold );
  suiteResults.results.forEach( function ( suiteResult ){
    console.log( '\n' + suiteResult.stats.name.bold );
    suiteResult.results.forEach( function ( testResult ){
      prettyPrintResult( testResult );
    });
    console.log( '\n  Pass: ' + suiteResult.stats.pass.toString().green );
    console.error( '  Fail: ' + suiteResult.stats.fail.toString().red );
    console.error( '  Placeholders: ' + suiteResult.stats.placeholder.toString().yellow );
    console.log( '  Took %sms', suiteResult.stats.timeTaken );
  });

  console.log( '\nAggregate test results'.bold );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.error( 'Fail: ' + suiteResults.stats.fail.toString().red );
  console.error( 'Placeholders: ' + suiteResults.stats.placeholder.toString().yellow );
  console.log( 'Took %sms', suiteResults.stats.timeTaken );
}

module.exports = prettyPrintSuiteResults;
