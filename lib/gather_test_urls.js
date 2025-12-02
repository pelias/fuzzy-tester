var _ = require('lodash');

function gatherTestCaseURL(testCase, testSuite, baseUrlObj) {
  var endpoint = testCase.endpoint || testSuite.endpoint || 'search';

  var urlObj = new URL(baseUrlObj);
  urlObj.pathname = urlObj.pathname + '/' + endpoint;

  for (var key of Object.keys(testCase.in)) {
    urlObj.searchParams.set(key, testCase.in[key]);
  }

  testCase.full_url = urlObj.toString();
  return testCase.full_url;
}

function gatherAutocompleteURLs(testCase, baseUrlObj) {
  // filter out reverse, place, etc
  if (testCase.in.text === undefined) {
    testCase.autocompleteURLs = [];
    return [];
  }

  var baseQuery = testCase.in;

  var autocompleteURLs = [];
  for (var i = 1; baseQuery.text && i <= baseQuery.text.length; i++) {
    var query = _.clone(baseQuery);
    query.text = baseQuery.text.substring(0, i);

    var urlObj = new URL(baseUrlObj);
    urlObj.pathname = urlObj.pathname + '/autocomplete';

    for (var key of Object.keys(query)) {
      urlObj.searchParams.set(key, query[key]);
    }

    var autocompleteURL = urlObj.toString();
    autocompleteURLs.push(autocompleteURL);
  }

  testCase.autocompleteURLs = autocompleteURLs;
  return autocompleteURLs;
}

function gatherTestSuiteURLs( config, testSuite ){
  var apiUrl = config.endpoint.url;

  var baseUrlObj = new URL(apiUrl);

  return _.flatten(testSuite.tests.map(function(testCase) {
    testCase.autocompleteURLs = [];

    var testCaseURLs = [gatherTestCaseURL(testCase, testSuite, baseUrlObj)];

    if (config.autocomplete) {
      var autocompleteURLs = gatherAutocompleteURLs(testCase, baseUrlObj);
      testCaseURLs = testCaseURLs.concat(autocompleteURLs);
    }
    return testCaseURLs;
  }));
}

function gatherTestURLs(config, testSuites) {
  return _.uniq(_.flatten(testSuites.map(function(testSuite) {
    return gatherTestSuiteURLs(config, testSuite);
  })));
}

module.exports = gatherTestURLs;
