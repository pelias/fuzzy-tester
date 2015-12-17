var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'Guardian police shooting tests',
  description: 'a list of locations of police shootings in the USA in 2015',
  source: 'http://www.theguardian.com/us-news/ng-interactive/2015/jun/01/the-counted-police-killings-us-database#',
  priorityThresh: 2,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffixes']
  },
};


var count = 0;

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var country_a = 'USA';
  var input = [record.streetaddress, record.city, record.state].join(', ');



  var test = {
    id: count,
    status: 'pass',
    user: 'Julian',
    in: {
      text: input
    },
    expected: {
      properties: [
        {
          name: record.streetaddress,
          locality: record.city,
          country_a: country_a,
          region_a: record.state
        }
      ]
    }
  };
  count++;
  this.push(test);
  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('police_shootings', test_file_json, full_stream, 2000);
