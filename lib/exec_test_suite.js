/**
 * @file exec_test_suite logic for running one single test suite
 */

'use strict';

var evalTest = require( '../lib/eval_test' );
var ExponentialBackoff = require( '../lib/ExponentialBackoff');
var request = require( 'request' );
var util = require( 'util' );

var validTestStatuses = [ 'pass', 'fail', undefined ];

function validateTestSuite(testSuite) {
  testSuite.tests.forEach( function ( testCase ){
    if( validTestStatuses.indexOf( testCase.status ) === -1 ){
      throw util.format(
        'Invalid test status: `%s`. Recognized statuses are: %s',
        testCase.status, JSON.stringify( validTestStatuses )
      );
    }

    if( 'unexpected' in testCase ){
      testCase.unexpected.properties.forEach( function ( props ){
        if( typeof props !== 'object' ){
          throw 'Unexpected properties MUST be objects! Strings are not supported. Exiting. ' +
            JSON.stringify( testCase, undefined, 4 );
        }
      });
    }
  });
}

/**
 * Sort test cases, orders string/number ids separately.
 */
function testCaseSort( a, b ){
    var isAStr = typeof a.testCase.id === 'string';
    var isBStr = typeof b.testCase.id === 'string';
    if( ( isAStr && isBStr ) || ( !isAStr && !isBStr ) ){
        return a.testCase.id > b.testCase.id ? 1 : -1;
    }
    else {
        return isAStr ? 1 : -1;
    }
}

function execTestSuite( apiUrl, testSuite, stats, cb ){
  var testResults = {
    stats: {
      pass: 0,
      fail: 0,
      placeholder: 0,
      regression: 0,
      timeTaken: null,
      name: testSuite.name
    },
    results: []
  };

  if( testSuite.tests.length === 0 ){
    process.nextTick( function (  ){
      cb( testResults );
    });
    return;
  }

  validateTestSuite(testSuite);

  var startTime = new Date().getTime();
  var totalTestsNum = testSuite.tests.length;

  var test_interval = new ExponentialBackoff(25, 3, 100);
  var intervalId;
  var runOneTest = function (){
    if( testSuite.tests.length === 0 ){
      return;
    }

    var testCase = testSuite.tests.pop();

    var requestOpts = {
      url: testCase.endpoint || testSuite.endpoint || 'search',
      baseUrl: apiUrl,
      qs: testCase.in,
      json: true
    };

    request( requestOpts, function ( err, res ){
      var retry_codes = [408, 413, 429];
      if( err ){
        console.error( err );
        testSuite.tests.push( testCase );
      }
      else if( retry_codes.indexOf(res.statusCode) !== -1 ){
        testSuite.tests.push( testCase );
        test_interval.increaseBackoff();
      }
      else if( res.statusCode !== 200 ){
        console.error( 'Unexpected status code %s, exiting.\n'.red, res.statusCode );
        console.error(
          'Failed for test case:\n%s\n',
          JSON.stringify( testCase, undefined, 4 ).replace( /^|\n/g, '\n\t' )
        );
        console.error(
          'Response:\n%s\n',
          JSON.stringify( res, undefined, 4 ).replace( /^|\n/g, '\n\t' )
        );
        console.error( '\nInvestigate manually:\n  curl %s', res.request.url.href );
        process.exit( 1 );
      } else {
        // no error or retry
        test_interval.decreaseBackoff();

        stats.testsCompleted++;
        process.stderr.write( util.format(
          '\rTests completed: %s/%s', stats.testsCompleted.toString().bold,
          stats.testsTotal
        ));

        var results = evalTest( testSuite.priorityThresh, testCase, res.body.features );
        if( results.result === 'pass' && testCase.status === 'fail' ){
          results.progress = 'improvement';
        }
        else if( results.result === 'fail' && testCase.status === 'pass' ){
          // subtract the regression from fail count, so we don't double count them
          testResults.stats.fail--;
          testResults.stats.regression++;
          results.progress = 'regression';
        }

        results.testCase = testCase;
        results.response = res;
        testResults.stats[ results.result ]++;
        testResults.results.push( results );
      }

      if( testResults.results.length === totalTestsNum ){
        testResults.stats.timeTaken = new Date().getTime() - startTime;

        /**
         * Sort the test-cases by id to force some output uniformity across
         * test-runs (since otherwise it'd depend entirely on when a given
         * request returned).
         */
        testResults.results.sort( testCaseSort );
        cb( testResults );
      } else {
        reenqueue();
      }
    });
  };

  var reenqueue = function reenqueue() {
    clearInterval(intervalId);
    intervalId = setInterval(runOneTest, test_interval.getBackoff());
  };

  reenqueue();
}

module.exports = execTestSuite;
