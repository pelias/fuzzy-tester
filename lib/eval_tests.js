var evalTest = require( '../lib/eval_test' );

var locations;
try {
    locations = require( path.resolve(process.cwd() + '/locations.json') );
} catch (e) {
    locations = {};
}

function printRequestErrorMessage(testCase, res) {
  console.error( 'Unexpected status code %s.\n'.red, res.statusCode );
  console.error(
    'Failed for test case:\n%s\n',
    JSON.stringify( testCase, undefined, 4 ).replace( /^|\n/g, '\n\t' )
  );
  console.error(
    'Response:\n%s\n',
    JSON.stringify( res, undefined, 4 ).replace( /^|\n/g, '\n\t' )
  );
  console.error( '\nInvestigate manually:\n  curl %s', res.request.url.href );
}

function createContext(testSuite, locations) {
  return {
    priorityThresh: testSuite.priorityThresh,
    locations: locations,
    weights: testSuite.weights,
    normalizers: testSuite.normalizers
  };
}

function eval_test_suite(testSuite, results) {
  var context = createContext(testSuite, locations);

  return testSuite.tests.map(function(testCase) {
    var res = results[testCase.full_url];
    var result;

    if( res.statusCode === 200 ){
      result = evalTest( testCase, res.body.features, context );
    } else {
      printRequestErrorMessage(testCase, res);

      result = {
        result: 'fail',
        msg: 'Unexpected status code ' + res.statusCode
      };

      result.testCase = testCase;
      return result;
    }
  });
}

function eval_tests(testSuites, results) {
  return testSuites.map(function(testSuite) {
    return eval_test_suite(testSuite, results);
  });
}

module.exports = eval_tests;
