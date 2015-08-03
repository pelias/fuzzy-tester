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
      console.log( util.format( '  ✔ %s[%s] "%s"', status, id, input ).green );
      break;

    case 'fail':
      console.error(
        util.format( '  ✘ %s[%s] "%s": %s', status, id, input, result.msg ).red
      );
      break;

    case 'placeholder':
      console.error( util.format( '  ! [%s] "%s": %s', id, input, result.msg ).cyan );
      break;

    default:
      console.error( util.format( 'Result type `%s` not recognized.', result.result ) );
      process.exit( 1 );
      break;
  }
}

/**
 * Format and print all of the results from any number of test-suites.
 */
function prettyPrintSuiteResults( suiteResults ){
  console.log( 'Tests for:', suiteResults.stats.url.blue + ' (' + suiteResults.stats.endpoint.blue + ')' );
  suiteResults.results.forEach( function ( suiteResult ){
    console.log( '\n' + suiteResult.stats.name.blue );
    suiteResult.results.forEach( function ( testResult ){
      prettyPrintResult( testResult );
    });
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.error( 'Fail: ' + suiteResults.stats.fail.toString().red );
  console.error( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numFail = suiteResults.stats.fail;
  var total = suiteResults.stats.pass +  suiteResults.stats.fail;
  var pass = suiteResults.stats.pass;
  var percentage = pass * 100.0 / total;
  console.log( 'Took %sms', suiteResults.stats.timeTaken );
  console.log( 'Test success rate %s%%', Math.round(percentage).toString());

  console.log( '' );
  if( numFail > 0 ){
    console.error( 'FATAL ERROR: %s failures(s) detected.'.red.inverse, numFail );
    process.exit( 1 );
  }
  else {
    console.log( '0 failures detected. All good.' );
  }
}

module.exports = prettyPrintSuiteResults;
