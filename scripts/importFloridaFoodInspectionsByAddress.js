var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: ',', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'Florida Food Inspection tests by address',
  description: 'tests from a Florida restaurant food inspection dataset',
  source: 'https://raw.githubusercontent.com/riordan/what-is-geocode/master/datasets/inspections-wo-geocodes.csv',
  priorityThresh: 5,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffexes']
  }
};

var count = 0;

var testCaseStream = through.obj(function(record, encoding, callback) {
  var full_address = record.location_address + ', ' + record.location_city + ', FL, ' + record.location_zip_code;

  var test = {
    id: record.license_number,
    status: 'pass',
    user: 'Julian',
    in: {
      text: full_address
    },
    expected: {
      properties: [
        {
          name: record.location_address,
          postalcode: record.location_zip_code,
          country_a: 'USA',
          region: 'Florida',
          region_a: 'FL',
          county: record.county_name + ' County',
          locality: record.city
        }
      ],
    }
  };

  if (record.long && record.lat) {
    test.expected.coordinates = [[record.long, record.lat]];
  } else {
    return callback();
  }

  count++;
  this.push(test);
  callback();

});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

importTestCases('florida_food_inspections_by_address', test_file_json, full_stream, 5000, 2);
