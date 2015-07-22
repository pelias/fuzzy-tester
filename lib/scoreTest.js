var helpers = require( '../lib/scoreHelpers' );
var equalProperties = require( '../lib/equal_properties' );
var scoreProperties = require( '../lib/scoreProperties' );

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

function scoreUnexpected(unexpected, apiResults, weight) {
  if (unexpected === undefined) {
    return helpers.initial_score;
  }

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

function scoreOneResult(expected, apiResult, apiResults, priorityThresh, weight) { // jshint ignore:line
  weight = weight || {};
  var subscores = [scoreProperties(expected, apiResult.properties, weight.properties),
    scorePriorityThresh(priorityThresh, apiResult, apiResults, weight.priorityThresh)];

  return subscores.reduce(helpers.reduceScores, helpers.initial_score);
}

function sortScores(score_a, score_b) {
  return score_b.score - score_a.score;
}

function scoreOneExpectation(expected, apiResults, priorityThresh, weights) {
  return apiResults.map(function(result) {
    var score = scoreOneResult(expected, result, apiResults, priorityThresh, weights);
    return score;
  }).sort(sortScores)[0];
}

function scoreTest(testCase, apiResults, priorityThresh, weights) {
  weights = weights || {};

  if(testCase === undefined) {
    return helpers.initial_score;
  }

  var scores = [];

  if (testCase.expected) {
    scores = scores.concat(testCase.expected.properties.map(function(expected) {
        return scoreOneExpectation(expected, apiResults, priorityThresh, weights);
    }));
  }

  if (testCase.unexpected) {
    scores = scores.concat(scoreUnexpected(testCase.unexpected, apiResults, weights.unexpected));
  }

  return scores.reduce(helpers.reduceScores, helpers.initial_score);
}

module.exports = scoreTest;
