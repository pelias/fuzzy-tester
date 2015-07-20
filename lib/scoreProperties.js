'use strict';

var isObject = require( 'is-object' );

function reduceScores(total_score, this_score) {
  return {
    score: total_score.score + this_score.score,
    max_score: total_score.max_score + this_score.max_score
  };
}

function scorePrimitiveProperty(expectation, result) {
  return {
    score: expectation === result ? 1: 0,
    max_score: 1
  };
}

module.exports = function scoreProperties(expectation, result) {
  if (isObject(expectation)) {
    var subscores = Object.keys(expectation).map(function(property){
      return scoreProperties(expectation[property], result[property]);
    });

    return subscores.reduce(reduceScores, { score: 0, max_score: 0});
  } else {
    return scorePrimitiveProperty(expectation, result);
  }
};
