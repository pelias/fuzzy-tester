var helpers = require( '../lib/scoreHelpers' );
var equalProperties = require( '../lib/equal_properties' );
var scoreCoordinates = require( '../lib/scoreCoordinates' );
var scoreProperties = require( '../lib/scoreProperties' );
const _ = require('lodash');
/**
 * Calculate the score component for a response feature object's position in the returned
 * response features. If it is later in the featuress than the threshold, no points.
 * Otherwise, full points.
 */
function scorePriorityThresh(priorityThresh, responseFeature, responseFeatures, weight) {
  var index = responseFeatures.indexOf(responseFeature);
  var diff = '';
  var score = weight;
  var success = helpers.inPriorityThresh(responseFeatures, responseFeature, priorityThresh);
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
 * response features. Full points are awarded if all of the unexpected properties
 * are completely absent from all API response features. Otherwise no points.
 */
function scoreUnexpected(unexpected, responseFeatures, weight) {
  weight = weight || 1;
  // unexpected properties should be absent from every returned response feature
  var unexpectedProperties = unexpected.properties.filter(function(property) {
    return responseFeatures.some(function(responseFeature) {
      return equalProperties(property, responseFeature.properties);
    });
  });
  var pass = unexpectedProperties.length === 0;

  var diff = unexpectedProperties.map(function(property) {
    return 'unexpected property found from ' + JSON.stringify(property);
  });

  return {
    score: pass ? weight : 0,
    max_score: weight,
    diff: pass ? '' : diff
  };
}

/**
 * Score one feature from the set of response features by combining the score
 * for its properties, score for its coordinates and whether or not it
 * satisfies the priorityThresh
 */
function scoreOneFeature(expected, responseFeature, responseFeatures, context) {
  var subscores = [
    scoreProperties(expected.properties, responseFeature.properties, context.weights.properties),
  ];

  if (expected.coordinates) {
    subscores = subscores.concat(scoreCoordinates(expected.coordinates, responseFeature,
      context.distanceThresh, context.weights.coordinates));
  }

  // only score priorityThresh when properties score match completely
  if (subscores[0].score === subscores[0].max_score) {
    subscores = subscores.concat(
      scorePriorityThresh(context.priorityThresh, responseFeature, responseFeatures, context.weights.priorityThresh)
    );
  }

  return subscores.reduce(helpers.combineScores, helpers.initial_score);
}

/**
 * Score one feature from the set of response features by combining the score
 * for its coordinates and whether or not it satisfies the priorityThresh
 */
function scoreOneCoordinateFeature(expected_coords, responseFeature, responseFeatures, context) {
  var subscores = [
    scoreCoordinates(expected_coords, responseFeature,
      context.distanceThresh, context.weights.coordinates)
  ];

  // only score priorityThresh when coordinates score matches
  if (subscores[0].score === subscores[0].max_score) {
    subscores = subscores.concat(
      scorePriorityThresh(context.priorityThresh, responseFeature, responseFeatures, context.weights.priorityThresh)
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
 * the highest score of any response feature when scored against this expectation.
 */
function scoreOneExpectation(expected, responseFeatures, context) {
  return responseFeatures.map(function(responseFeature) {
    var score = scoreOneFeature(expected, responseFeature, responseFeatures, context);
    return score;
  }).sort(sortScores)[0];
}

/**
 * Score one (out of potentially many) coordinate expectation
 * independently of properties
 */
function scoreOneCoordinateExpectation(expected_coords, responseFeatures, context) {
  return responseFeatures.map(function(responseFeature) {
    var score = scoreOneCoordinateFeature(expected_coords, responseFeature, responseFeatures, context);
    return score;
  }).sort(sortScores)[0];
}

function evaluateSymbol(size, length) {
  const exec = /^(?<symbol>[<>=]+)?\s*(?<number>[0-9]+)$/.exec(size.trim());
  const symbol = exec?.groups?.symbol || '==';
  const number = _.parseInt(exec?.groups?.number);
  switch(symbol) {
    case '<=': return length <= number;
    case '<': return length < number;
    case '>=': return length >= number;
    case '>': return length > number;
    case '==': return length === number;
    default: return false;
  }
}

function scoreSize(size, responseFeatures) {
  const scored = evaluateSymbol(size, responseFeatures.length);
  if (!scored) {
    return {score: 0, max_score: 1, diff: [`size is ${size} but found ${responseFeatures.length}`]};
  }
  return {score: 1, max_score: 1, diff: []};
}

/**
 * Score an entire test by combining the score for each expectation,
 * and the score for any unexpected properties.
 */
function scoreTest(testCase, responseFeatures, context) {
  var scores = [];

  if (testCase.expected) {
    var coordinates = testCase.expected.coordinates || [];
    scores = scores.concat(testCase.expected.properties.map(function(expected_props, index) {
      var expected = { 'properties':  expected_props, 'coordinates': coordinates[index] };

      return scoreOneExpectation(expected, responseFeatures, context);
    }));

    // If there are no 'text' properties, run plain coordinate matching
    if (testCase.expected.properties.length===0 && testCase.expected.coordinates) {
      scores = scores.concat(testCase.expected.coordinates.map(function(expected_coords) {
        return scoreOneCoordinateExpectation(expected_coords, responseFeatures, context);
      }));
    }

    if (_.isString(testCase.expected.size)) {
      scores = scores.concat(scoreSize(testCase.expected.size, responseFeatures));
    }
  }

  if (testCase.unexpected) {
    scores = scores.concat(scoreUnexpected(testCase.unexpected, responseFeatures, context.weights.unexpected));
  }

  return scores.reduce(helpers.combineScores, helpers.initial_score);
}

module.exports = {
  scoreUnexpected: scoreUnexpected,
  scoreTest: scoreTest
};
