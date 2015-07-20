'use strict';

var isObject = require( 'is-object' );
var deepDiff = require( 'deep-diff' );

/**
 * Use the deep-diff library to create an (almost too) detailed description
 * of the differences between the expected and actual properties. Some massaging
 * of the data so only the parts we care about are shown is done.
 */
function createDiff(expectation, result) {
  var diff = deepDiff.diff(expectation, result);

  // objects with no differences have an undefined diff
  if (diff === undefined) {
    return ''; // return an empty string for less confusing output later
  }

  // filter out diff elements corresponding to a new element on the right side
  // these are ignored by our tests and would just be noise
  return diff.filter(function(diff_part) {
    return diff_part.kind !== 'N';
  });
}

function reduceScores(total_score, this_score) {
  return {
    score: total_score.score + this_score.score,
    max_score: total_score.max_score + this_score.max_score,
    diff: total_score.diff // simply pass along the diff, it's recalculated at the object level
  };
}

function scorePrimitiveProperty(expectation, result, weight) {
  weight = weight || 1;

  return {
    score: expectation === result ? weight : 0,
    max_score: weight
  };
}

module.exports = function scoreProperties(expectation, result, weight) {
  if (isObject(expectation)) {
    weight = weight || {};
    var subscores = Object.keys(expectation).map(function(property){
      return scoreProperties(expectation[property], result[property], weight[property]);
    });

    return subscores.reduce(reduceScores, { score: 0, max_score: 0, diff: createDiff(expectation, result)});
  } else {
    return scorePrimitiveProperty(expectation, result, weight);
  }
};
