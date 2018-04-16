var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: '/v1/search address',
  description: 'addresses in Portland, OR',
  priorityThresh: 1,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffixes']
  },
};

var count = 0;

function makeTestJson(text, expectedObject) {
  count++;
  return {
    id: count,
    status: 'pass',
    in: {
      text: text
    },
    expected: {
      properties: [
        expectedObject
      ]
    }
  };
}

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var country_a = 'USA';
  const city = record.city || 'Portland';
  const state = 'Oregon';
  const state_abbr = 'OR';

  const expectedObject = {
    name: record.name,
    locality: city,
    region: state,
    region_a: state_abbr
  };

  // city, ST, commas
  var input = [record.name, city, state_abbr].join(', ');

  this.push(makeTestJson(input, expectedObject));

  // city, state, commas
  input = [record.name, city, state].join(', ');
  this.push(makeTestJson(input, expectedObject));

  // city, ST, no commas
  input = [record.name, city, state_abbr].join(' ');
  this.push(makeTestJson(input, expectedObject));

  // city, state, no commas
  input = [record.name, city, state].join(' ');
  this.push(makeTestJson(input, expectedObject));

  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('portland_addresses', test_file_json, full_stream, 2000);
