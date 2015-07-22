'use strict';

var scoreTest = require( '../lib/scoreTest' );
var sanitiseTestCase = require( '../lib/sanitiseTestCase' );
var isObject = require( 'is-object' );

function formatTestErrors(score) {
  var message = 'score ' + score.score + ' out of ' + score.max_score;

  if (score.score < score.max_score) {
    message += '\ndiff: ' + JSON.stringify(score.diff, null, 2);
  }

  return message;
}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( priorityThresh, testCase, apiResults, locations ){
  locations = locations || {};

  testCase = sanitiseTestCase(testCase, locations);

  // on error, sanitiseTestCase returns an error message string
  if (typeof testCase === 'string') {
    return {
      result: 'placeholder',
      msg: testCase
    };
  }

  if ( !isObject(apiResults) || apiResults.length === 0 ) {
    return {
      result: 'fail',
      msg: 'no results returned'
    };
  }

  if( 'expected' in testCase && 'priorityThresh' in testCase.expected ){
    priorityThresh = testCase.expected.priorityThresh;
  }

  var score = scoreTest(testCase, apiResults, priorityThresh);

  return {
    result: (score.score < score.max_score) ? 'fail' : 'pass',
    msg: formatTestErrors(score)
  };
}

module.exports = evalTest;
