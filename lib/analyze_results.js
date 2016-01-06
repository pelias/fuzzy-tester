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

// return true if a given url for a test case passes
function testCaseUrlPasses(testCase, url) {
  return testCase.results[url].result === 'pass';
}

function allAutocompleteTestsFail(testCase) {
  return testCase.autocompleteURLs.every(function(url) {
    return !testCaseUrlPasses(testCase, url);
  });
}

// return true if the full search query for this test case passes
function searchPasses(testCase) {
  return testCaseUrlPasses(testCase, testCase.full_url);
}

// return true if the test case passes search but never autocomplete
function testCasePassesSearchNotAutocomplete(testCase) {
  return searchPasses(testCase) && allAutocompleteTestsFail(testCase);
}

/* take a set of testSuites and a predicate function (function that only returns true or false)
 * and return the number of test cases within all the test suites that pass that function
 */
function count_passing_test_cases(testSuites, predicateFunction) {
  return testSuites.reduce(function(count, testSuite) {
    return testSuite.tests.reduce(function(testCaseCount, testCase) {
      return testCaseCount + (predicateFunction(testCase) ? 1 : 0);
    }, count);
  }, 0);
}

/*
 * Count the number of test cases where a /search query for the full text
 * input fails, but autocomplete never passes. These generally represent good
 * tests that autocomplete can't handle well
 */
function count_autocomplete_fails_search_passes(testSuites) {
  return count_passing_test_cases(testSuites, testCasePassesSearchNotAutocomplete);
}

/*
 * Count the number of test cases where autocomplete passes, but then
 * when more of the full text input is typed, it fails. This really confuses users
 * and causes them to report autocomplete "jumpiness" which we really want to avoid
 */
function testCaseAutocompletePassesThenFails(testCase) {
  var hasPassed = false;
  return testCase.autocompleteURLs.some(function(url) {
    var testPassed = testCaseUrlPasses(testCase, url);

    // once one autocomplete test has passed, take note for later tests
    hasPassed = hasPassed || testPassed;

    // if this test failed but previous passed, this is a jumpy result
    return hasPassed && !testPassed;
  });
}

function count_autocomplete_passes_then_fails(testSuites) {
  return count_passing_test_cases(testSuites, testCaseAutocompletePassesThenFails);
}

/*
 * return true if autocomplete for this test case only returns true
 * on the last character
 */
function testCaseOnlyLastAutocompleteTestPasses(testCase) {
  var urlPassesThisTestCase = testCaseUrlPasses.bind(undefined, testCase);
  var urls = testCase.autocompleteURLs;
  var url_count = urls.length;

  if (url_count < 2) {
    return false;
  }

  var lastUrlPasses = urlPassesThisTestCase(urls[url_count - 1]);
  var allOtherUrlsFail = urls.slice(0, url_count - 1).every(function(url) {
    return urlPassesThisTestCase(url) === false;
  });

  return lastUrlPasses && allOtherUrlsFail;
}

/*
 * count the number of test cases where autocomplete returns the correct results,
 * but only on the last keystroke, which is not exactly helpful
 */
function count_autocomplete_passes_on_last_character(testSuites) {
  return count_passing_test_cases(testSuites, testCaseOnlyLastAutocompleteTestPasses);
}

function generate_autocomplete_analysis(testSuites) {
  return {
    // autocomplete fails, search passes
    autocomplete_fails_search_passes: count_autocomplete_fails_search_passes(testSuites),

    // autocomplete passes, then later fails (aka jumpy results)
    autocomplete_passes_then_fails: count_autocomplete_passes_then_fails(testSuites),

    only_last_character_passes: count_autocomplete_passes_on_last_character(testSuites)
  };
}

/*
 * Takes results that have been evaluated with scores, and does any needeed
 * final analysis
 */
function analyze_results(testSuites, results, config, startTime) {
  results = calculate_progress(results);
  results.stats = generate_stats(results);

  if (config.autocomplete) {
    results.autocomplete = generate_autocomplete_analysis(testSuites);
  }

  // calculate running time
  results.stats.timeTaken = new Date().getTime() - startTime;

  return results;
}

module.exports = analyze_results;
