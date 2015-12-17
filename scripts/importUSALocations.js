var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'USA location tests',
  description: 'a list of USA locations',
  source: 'https://gist.github.com/Caged/6ce6b2a6ecda4579b64f',
  priorityThresh: 2,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffexes']
  },
};


var count = 0;

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var parts = record.location.split(', ');
  var state = parts[1];

  var country_a = 'USA';

  var canada = [ 'British Columbia', 'Quebec', 'Alberta'];

  if (canada.indexOf(state) !== -1) {
    country_a = 'CAN';
  }

  var other = [ 'NA', ''];

  if( other.indexOf(state) !== -1) {
    country_a = undefined;
  }

  if ( state === 'Germany') {
    country_a = 'DEU';
  }

  var test = {
    id: count,
    status: 'pass',
    user: 'Julian',
    in: {
      text: record.location
    },
    expected: {
      properties: [
        {
          name: record[0],
          country_a: country_a,
          region: state
        }
      ]
    }
  };
  count++;
  this.push(test);
  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('north_america_cities', test_file_json, full_stream, 1000);
