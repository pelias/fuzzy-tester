var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'Wikipedia landmarks',
  description: '',
  source: '',
  priorityThresh: 2,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffexes']
  }
};

var testCaseStream = through.obj(function(record, encoding, callback) {
  console.log(record.types);

  var to_import = ['city', 'edu', 'airport'];

  if ( to_import.indexOf(record.types) === -1 ){
    return callback();
  }

  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('wikipedia_landmarks', test_file_json, full_stream, 5000);
