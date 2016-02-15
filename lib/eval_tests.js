var _ = require( 'lodash' );
var evalTest = require( '../lib/eval_test' );
var test_suite_helpers = require( '../lib/test_suite_helpers' );

function printRequestErrorMessage(testCase, res) {
  // replacer for console.error of testCase to avoid circular structure
  function replace(key, value) {
    if (key === 'results') {
      return undefined;
    }
    return value;
  }
  console.error( 'Unexpected status code %s.\n'.red, res.statusCode );
  console.error(
    'Failed for test case:\n%s\n',
    JSON.stringify( testCase, replace, 4 ).replace( /^|\n/g, '\n\t' )
  );
  console.error(
    'Response:\n%s\n',
    JSON.stringify( res, undefined, 4 ).replace( /^|\n/g, '\n\t' )
  );
  console.error( '\nInvestigate manually:\n  curl %s', res.request.uri.href );
}

function createContext(testSuite, locations) {
  return {
    priorityThresh: testSuite.priorityThresh,
    distanceThresh: testSuite.distanceThresh,
    locations: locations,
    weights: testSuite.weights,
    normalizers: testSuite.normalizers
  };
}

function eval_test_suite(testSuite, results) {
  var locations = test_suite_helpers.getLocations();
  var context = createContext(testSuite, locations);

  return testSuite.tests.map(function(testCase) {
    var urls = [].concat(testCase.full_url, testCase.autocompleteURLs);
    testCase.results = {};

    if (!urls) { return [];
    }

    return urls.map(function(url) {
      var res = results[url];
      var result;

      if( res.statusCode === 200 ){
        result = evalTest( testCase, res.body.features, context );
      } else {
        printRequestErrorMessage(testCase, res);

        result = {
          result: 'fail',
          msg: 'Unexpected status code ' + res.statusCode
        };
      }

      result.url = url;
      result.testCase = testCase;
      testCase.results[url] = result;

      return result;
    });
  });
}

function eval_tests(testSuites, results) {
  return _.flatten(testSuites.map(function(testSuite) {
    return eval_test_suite(testSuite, results);
  }));
}

module.exports = eval_tests;
