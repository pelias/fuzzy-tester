var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'US States',
  description: '',
  source: 'Wikipedia',
  priorityThresh: 2,
  normalizers: {
    name: ['toLowerCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals']
  }
};

function getLat(location) {
  const str = location.split(' ')[3];

  return parseFloat(str);
}

function getLon(location) {
  const str = location.split(' ')[4];

  return -1 * parseFloat(str);
}

let row = 0;


var testCaseStream = through.obj(function(record, encoding, callback) {
  row++;

  if (row > 50) {
    return callback();
  }

  const name = record.Name.replace(/(\[.*\])/,'');

  const abbr = record.abbr;
  console.log(name, abbr);

  const test_case = {
    id: row,
    status: 'pass',
    in: {
      text: name
    },
    expected: {
      properties: [
        {
          name: name,
          region: name,
          region_a: abbr,
          country_a: 'USA'
        }
      ]
    }
  };

  callback(null, test_case);
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('us_states', test_file_json, full_stream, 5000);
