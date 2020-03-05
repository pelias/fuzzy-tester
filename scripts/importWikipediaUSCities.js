const _ = require('lodash');
var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'Top US cities',
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

function makeBaseTest(record) {
  const city = record.City.replace(/(\[.*\])/,'');

  const state = record['State[c]'];

  const coords = {
    lat: getLat(record.Location),
    lon: getLon(record.Location)
  }

  const test_case = {
    id: row,
    status: 'pass',
    in: {
      text: city
    },
    expected: {
      coordinates: [ coords.lon, coords.lat ],
      distanceThresh: 50000, // 50km
      properties: [
        {
          name: city,
          region: state,
          country_a: 'USA'
        }
      ]
    }
  };

  return test_case;
}

function makeBoundaryCountryTest(base_test) {
  const new_test = _.merge({}, base_test);

  new_test.id = `${base_test.id}.boundary_country`;

  new_test.in['boundary.country'] = 'USA';

  return new_test;
}



var testCaseStream = through.obj(function(record, encoding, callback) {
  row++;

  if (row > 500) {
    return callback();
  }

  const base_test = makeBaseTest(record);
  const boundary_country_test = makeBoundaryCountryTest(base_test);


  this.push(base_test);
  this.push(boundary_country_test);

  callback(null);
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('top_us_cities', test_file_json, full_stream, 5000);
