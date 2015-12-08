/**
 * @file A terminal output generator for test-suites results.
 */

'use strict';

// add color methods to String.prototype
require( 'colors' );

var util = require( 'util' );

/**
 * Format and print a test result to the terminal.
 */
function prettyPrintResult( result ){
  var id = result.testCase.id;
  delete result.testCase.in.api_key; // don't display API key
  var input = JSON.stringify(result.testCase.in);
  var status = (result.progress === undefined) ? '' : result.progress.inverse + ' ';
  switch( result.result ){
    case 'pass':
      console.log( util.format( '  ✔ %s[%s] "%s"', status, id, input ).green );
      break;

    case 'fail':
      var color = (result.progress === 'regression') ? 'red' : 'yellow';
      console.error(
        util.format( '  ✘ %s[%s] "%s": %s', status, id, input, result.msg )[ color ]
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
function prettyPrintSuiteResults( suiteResults, config ){
  console.log( 'Tests for:', config.endpoint.url.blue + ' (' + config.endpoint.name.blue + ')' );
  suiteResults.forEach( function ( suiteResult ){
    //console.log( '\n' + suiteResult.stats.name.blue );
    suiteResult.forEach( function ( testResult ){
      prettyPrintResult( testResult );
    });
  });

  console.log( '\nAggregate test results'.blue );
  console.log( 'Pass: ' + suiteResults.stats.pass.toString().green );
  console.error( 'Fail: ' + suiteResults.stats.fail.toString().yellow );
  console.error( 'Placeholders: ' + suiteResults.stats.placeholder.toString().cyan );

  var numRegressions = suiteResults.stats.regression;
  var regressionsColor = ( numRegressions > 0 ) ? 'red' : 'yellow';
  var total = suiteResults.stats.pass +  suiteResults.stats.fail + suiteResults.stats.regression;
  var pass = total - numRegressions;
  var percentage = pass * 100.0 / total;
  console.log( 'Regressions: ' + numRegressions.toString()[ regressionsColor ] );
  console.log( 'Took %sms', suiteResults.stats.timeTaken );
  console.log( 'Test success rate %s%%', Math.round(percentage).toString());

  console.log( '' );
  if( numRegressions > 0 ){
    console.error( 'FATAL ERROR: %s regression(s) detected.'.red.inverse, numRegressions );
    return 1;
  }
  else {
    console.log( '0 regressions detected. All good.' );
    return 0;
  }
}

module.exports = prettyPrintSuiteResults;
