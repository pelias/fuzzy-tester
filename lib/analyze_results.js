var test_suite_helpers = require( './test_suite_helpers' );


function calculate_progress(results) {
  results.forEach(function(testSuiteResults) {
    testSuiteResults.forEach(function(testCaseResult) {
      testCaseResult.progress = test_suite_helpers.getTestCaseProgress(testCaseResult, testCaseResult.testCase);
    });
  });

  return results;
}

/**
 * Get the term used to track stats for this test in a test suite
 * This is the progress of a test case if it exists, otherwise its the result
 */
function getStatKey(results) {
  return results.progress || results.result;
}

function generate_stats(results) {
  var stats = {
    fail: 0,
    pass: 0,
    regression: 0,
    improvement: 0,
    placeholder: 0
  };

  results.forEach(function(testSuiteResults) {
    testSuiteResults.forEach(function(testCaseResult) {
      stats[getStatKey(testCaseResult)]++;
    });
  });

  return stats;
}


/*
 * Takes results that have been evaluated with scores, and does any needeed
 * final analysis
 */
function analyze_results(results, startTime) {
  results = calculate_progress(results);
  results.stats = generate_stats(results);

  // calculate running time
  results.stats.timeTaken = new Date().getTime() - startTime;

  return results;
}

module.exports = analyze_results;
