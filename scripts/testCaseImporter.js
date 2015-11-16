var fs = require('fs');
var _ = require('lodash');
var through = require('through2');

var base_test_skeleton = {
  name: 'you forgot to change the name',
  description: 'you forgot to set the description',
  priorityThresh: 5
};

function sample_percent(percent) {
  var random = Math.floor((Math.random() * 100));
  return random < percent;
}

function importTestCases(fileNamePrefix, testSuiteConfig, testCaseStream, max_tests_per_file, sampling_factor) { // jshint ignore:line
  if (max_tests_per_file === undefined) {
    max_tests_per_file = Infinity;
  }

  if (sampling_factor === undefined) {
    sampling_factor = 100;
  }

  var test_suite_template = _.extend({}, base_test_skeleton, testSuiteConfig);

  var testCaseSampler = through.obj(function(chunk, encoding, callback) {

    if (sample_percent(sampling_factor)) {
      this.push(chunk);
    }
    callback();
  });

  var aggregator = [];
  var testCaseAggregator = through.obj(function(chunk, encoding, callback) {
    aggregator.push(chunk);

    if (aggregator.length >= max_tests_per_file) {
      this.push(aggregator);
      aggregator = [];
    }
    callback();
  }, function(callback) {
    this.push(aggregator);
    callback();
  });

  var fileCount = 1;

  var testSuiteWriter = through.obj(function(chunk, encoding, callback) {
    var testSuite = _.extend({}, test_suite_template);

    testSuite.tests = chunk;
    testSuite.name = testSuite.name + ' part ' + fileCount;
    var filename = fileNamePrefix + '_' + fileCount + '.json';

    fs.writeFile(filename, JSON.stringify(testSuite, null, 2), function(err) {
      if (err) {
        throw err;
      }
      fileCount++;
      callback();
    });
  });

  testCaseStream.pipe(testCaseSampler)
  .pipe(testCaseAggregator)
  .pipe(testSuiteWriter);
}

module.exports = importTestCases;
