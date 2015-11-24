var apiKey = require( '../lib/apiKey' );
var url = require ('url');
var _ = require('lodash');

function gatherTestSuiteURLs( config, testSuite ){
  var apiUrl = config.endpoint.url;

  var key = apiKey( apiUrl );
  var baseUrlObj = url.parse(apiUrl);

  return testSuite.tests.map(function(testCase) {
    if( key ){
      testCase.in.api_key = key;
    }
    var endpoint = testCase.endpoint || testSuite.endpoint || 'search';

    var urlObj = {
      pathname: baseUrlObj.pathname + '/' + endpoint,
      host: baseUrlObj.host,
      protocol: baseUrlObj.protocol,
      query: testCase.in
    };

    testCase.full_url = url.format(urlObj);
    return testCase.full_url;
  });
}

function gatherTestURLs(config, testSuites) {
  return _.unique(_.flatten(testSuites.map(function(testSuite) {
    return gatherTestSuiteURLs(config, testSuite);
  })));
}

module.exports = gatherTestURLs;
