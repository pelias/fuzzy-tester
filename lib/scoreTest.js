var helpers = require( '../lib/scoreHelpers' );
var equalProperties = require( '../lib/equal_properties' );
var scoreProperties = require( '../lib/scoreProperties' );

/**
 * Calculate the score component for a results object's position in the returned
 * results. If it is later in the results than the threshold, no points.
 * Otherwise, full points.
 */
function scorePriorityThresh(priorityThresh, result, apiResults, weight) {
  weight = weight || 1;

  var index = apiResults.indexOf(result);
  var diff = '';
  var score = weight;
  var success = helpers.inPriorityThresh(apiResults, result, priorityThresh);
  if (!success) {
    score = 0;
    diff = 'priorityThresh is ' + priorityThresh + ' but found at position ' + (index + 1);
  }

  return {
    score: score,
    max_score: weight,
    diff: diff
  };
}

/**
 * Calculate the score component for the absence of unexpected properties in
 * API results. Full points are awarded if all of the unexpected properties
 * are completely absent from all API results. Otherwise no points.
 */
function scoreUnexpected(unexpected, apiResults, weight) {
  weight = weight || 1;

  // unexpected result should be absent from every returned result
  var pass = apiResults.every(function(result) {
    // if every unexpected input is not found, the tests pass
    return unexpected.properties.every(function(property) {
      return !equalProperties(property, result.properties);
    });
  });

  return {
    score: pass ? weight : 0,
    max_score: weight,
    diff: pass ? '' : 'unexpected result found'
  };
}

/**
 * Score one result from the set of api results by combining the score
 * for its properties and whether or not it satisfies the priorityThresh
 */
function scoreOneResult(expected, apiResult, apiResults, priorityThresh, weight) { // jshint ignore:line
  weight = weight || {};
  var subscores = [
    scoreProperties(expected, apiResult.properties, weight.properties),
    scorePriorityThresh(priorityThresh, apiResult, apiResults, weight.priorityThresh)
  ];

  return subscores.reduce(helpers.combineScores, helpers.initial_score);
}

/**
 * Helper method to sort scores in descending order
 */
function sortScores(score_a, score_b) {
  return score_b.score - score_a.score;
}

/**
 * Score one (out of potentially many) expectations in a test suite by finding
 * the highest score of any api result when scored against this expectation.
 */
function scoreOneExpectation(expected, apiResults, priorityThresh, weights) {
  return apiResults.map(function(result) {
    var score = scoreOneResult(expected, result, apiResults, priorityThresh, weights);
    return score;
  }).sort(sortScores)[0];
}

/**
 * Score an entire test by combining the score for each expectation, and the
 * score for any unexpected properties.
 */
function scoreTest(testCase, apiResults, priorityThresh, weights) {
  weights = weights || {};

  var scores = [];

  if (testCase.expected) {
    scores = scores.concat(testCase.expected.properties.map(function(expected) {
        return scoreOneExpectation(expected, apiResults, priorityThresh, weights);
    }));
  }

  if (testCase.unexpected) {
    scores = scores.concat(scoreUnexpected(testCase.unexpected, apiResults, weights.unexpected));
  }

  return scores.reduce(helpers.combineScores, helpers.initial_score);
}

module.exports = scoreTest;
