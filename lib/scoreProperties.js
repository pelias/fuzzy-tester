'use strict';

var isObject = require( 'is-object' );
var helpers = require( '../lib/scoreHelpers' );

/**
 * Helper function to score javascript primitives (i.e. not objects)
 */
function scorePrimitiveProperty(expectation, result, weight) {
  weight = weight || 1;

  return {
    score: expectation === result ? weight : 0,
    max_score: weight
  };
}

/**
 * Calculate the score of an api result against given expectations by iterating
 * through all the keys, calculating the subscores, and aggregating them
 */
function scoreProperties(expectation, result, weight) {
  if (isObject(expectation) && isObject(result)) {
    weight = weight || {};
    var subscores = Object.keys(expectation).map(function(property){
      return scoreProperties(expectation[property], result[property], weight[property]);
    });

    var diff = helpers.createDiff(expectation, result);
    return subscores.reduce(helpers.combineScores, { score: 0, max_score: 0, diff: diff});
  } else {
    return scorePrimitiveProperty(expectation, result, weight);
  }
}

module.exports = scoreProperties;
