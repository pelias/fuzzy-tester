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
 * Combine a context passed in from a test suite with properties
 * from one individual test case to create the final context for this
 * test case. It handles locations, weights, and priorityThresh
 */
function makeTestContext( testCase, context ) {
  context.locations = context.locations || {};
  context.weights = context.weights || {};

  if( 'expected' in testCase && 'priorityThresh' in testCase.expected ){
    context.priorityThresh = testCase.expected.priorityThresh;
  }

  return context;
}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( testCase, apiResults, context ){
  context = makeTestContext( testCase, context );

  testCase = sanitiseTestCase(testCase, context.locations);

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

  var score = scoreTest(testCase, apiResults, context);

  return {
    result: (score.score < score.max_score) ? 'fail' : 'pass',
    score: score.score,
    max_score: score.max_score,
    msg: formatTestErrors(score)
  };
}

module.exports = evalTest;
