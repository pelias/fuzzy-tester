var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'San Francisco Schools',
  description: '',
  source: 'https://data.sfgov.org/Geographic-Locations-and-Boundaries/San-Francisco-Public-Schools-Points/sert-rabb',
  priorityThresh: 2,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffixes']
  },
};


var count = 0;

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var text = record.FACILITY_N + ', San Francisco, CA';

  var test = {
    id: count,
    status: 'pass',
    user: 'Julian',
    in: {
      text: text
    },
    expected: {
      properties: [
        {
          name: record.FACILITY_N,
          locality: 'San Francisco',
          country_a: 'USA',
          region: 'California'
        }
      ],
      coordinates: {
        lat: record.Y,
        lon: record.X
      }
    }
  };
  count++;
  this.push(test);
  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('San Francisco Schools', test_file_json, full_stream, 1000);
