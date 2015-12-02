var apiKey = require( '../lib/apiKey' );
var url = require ('url');
var _ = require('lodash');

function gatherTestSuiteURLs( config, testSuite ){
  var apiUrl = config.endpoint.url;

  var key = apiKey( apiUrl );
  var baseUrlObj = url.parse(apiUrl);

  return testSuite.tests.map(function(testCase) {
    // filter out reverse, place, etc
    if (testCase.in.text === undefined) {
      testCase.autocompleteURLs = [];
      return;
    }

    if( key ){
      testCase.in.api_key = key;
    }
    var baseQuery = testCase.in;

    var autocompleteURLs = [];
    for (var i = 1; baseQuery.text && i <= baseQuery.text.length; i++) {
      var query = _.clone(baseQuery);
      query.text = baseQuery.text.substring(0, i);

      var urlObj = {
        pathname: baseUrlObj.pathname + '/autocomplete',
        host: baseUrlObj.host,
        protocol: baseUrlObj.protocol,
        query: query
      };

      var autocompleteURL = url.format(urlObj);
      autocompleteURLs.push(autocompleteURL);
    }

    testCase.autocompleteURLs = autocompleteURLs;
    return autocompleteURLs;
  });
}

function gatherTestURLs(config, testSuites) {
  return _.unique(_.flatten(testSuites.map(function(testSuite) {
    var urls = _.unique(_.flatten(gatherTestSuiteURLs(config, testSuite)));
    urls = urls.filter(function(u) {
      return u !== undefined;
    });
    return urls;
  })));
}

module.exports = gatherTestURLs;
