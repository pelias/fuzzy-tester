var helpers = require( '../lib/scoreHelpers' );
var equalProperties = require( '../lib/equal_properties' );
var scoreCoordinates = require( '../lib/scoreCoordinates' );
var scoreProperties = require( '../lib/scoreProperties' );

/**
 * Calculate the score component for a results object's position in the returned
 * results. If it is later in the results than the threshold, no points.
 * Otherwise, full points.
 */
function scorePriorityThresh(priorityThresh, result, apiResults, weight) {
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
    diff: diff,
    priorityThresh: priorityThresh,
    index: index
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
function scoreOneResult(expected, apiResult, apiResults, context) {
  var subscores = [
    scoreProperties(expected, apiResult.properties, context.weights.properties),
  ];

  // only score priorityThresh when properties score match completely
  if (subscores[0].score === subscores[0].max_score) {
    subscores = subscores.concat(
      scorePriorityThresh(context.priorityThresh, apiResult, apiResults, context.weights.priorityThresh)
    );
  }

  return subscores.reduce(helpers.combineScores, helpers.initial_score);
}

/**
 * Score one result from the set of api results by combining the score
 * for its coordinates and whether or not it satisfies the priorityThresh
 */
function scoreOneCoordinateResult(expected, apiResult, apiResults, context) {
  var subscores = [
      scoreCoordinates(expected, apiResult.geometry.coordinates,
		       context.distanceThresh, context.weights.coordinates)
  ];

  // only score priorityThresh when coordinates score match completely
  if (subscores[0].score === subscores[0].max_score) {
    subscores = subscores.concat(
      scorePriorityThresh(context.priorityThresh, apiResult, apiResults, context.weights.priorityThresh)
    );
  }

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
function scoreOneExpectation(expected, apiResults, context) {
  return apiResults.map(function(result) {
    var score = scoreOneResult(expected, result, apiResults, context);
    return score;
  }).sort(sortScores)[0];
}

/**
 * Score one (out of potentially many) coordinate expectation
 */
function scoreOneCoordinateExpectation(expected, apiResults, context) {
  return apiResults.map(function(result) {
    var score = scoreOneCoordinateResult(expected, result, apiResults, context);
    return score;
  }).sort(sortScores)[0];
}

/**
 * Score an entire test by combining the score for each expectation, and the
 * score for any unexpected properties.
 */
function scoreTest(testCase, apiResults, context) {
  var scores = [];

  if (testCase.expected) {
    scores = scores.concat(testCase.expected.properties.map(function(expected) {
      return scoreOneExpectation(expected, apiResults, context);
    }));

    if (testCase.expected.coordinates) {
        scores = scores.concat(testCase.expected.coordinates.map(function(expected_coords) {
          return scoreOneCoordinateExpectation(expected_coords, apiResults, context);
	}));
    }
  }

  if (testCase.unexpected) {
    scores = scores.concat(scoreUnexpected(testCase.unexpected, apiResults, context.weights.unexpected));
  }

  return scores.reduce(helpers.combineScores, helpers.initial_score);
}

module.exports = scoreTest;
