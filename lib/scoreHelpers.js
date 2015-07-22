var deepDiff = require( 'deep-diff' );

var initial_score = {score: 0, max_score: 0, diff: []};

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

/**
 * function to be used with Array.reduce to combine several subscores for
 * the same object and build one score that combines all of them.
 * It totals up the actual and maximum score, and concatenates
 * multiple diff or error outputs into an array
 */
function combineScores(total_score, this_score) {
  var new_diff = total_score.diff;
  if (this_score.diff) {
    new_diff = total_score.diff.concat(this_score.diff);
  }

  return {
    score: total_score.score + this_score.score,
    max_score: total_score.max_score + this_score.max_score,
    diff: new_diff
  };
}

/**
 * Small helper function to determine if a given apiResult is high
 * enough in a set of results to pass a priority threshold.
 * Caveat: the result object must be the exact same javascript object
 * as the one taken from the apiResults, not just another object with
 * identical properties
 */
function inPriorityThresh(apiResults, result, priorityThresh) {
  var index = apiResults.indexOf(result);
  return index !== -1 && index <= priorityThresh - 1;
}

module.exports = {
  initial_score: initial_score,
  createDiff: createDiff,
  combineScores: combineScores,
  inPriorityThresh: inPriorityThresh
};
