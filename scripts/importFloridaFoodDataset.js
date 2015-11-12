var csv_parse = require('csv-parse');
var fs = require('fs');

var filename = process.argv[2];

var csv_parser = csv_parse({ delimiter: ',', columns: true});

var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'Florida Food Inspection tests',
  description: 'tests from a Florida restaurant food inspection dataset',
  source: 'https://raw.githubusercontent.com/riordan/what-is-geocode/master/datasets/inspections-wo-geocodes.csv',
  priorityThresh: 5,
  normalizers: {
    name: ['toUpperCase', 'removeOrdinals', 'stripPunctuation', 'abbreviateDirectionals', 'abbreviateStreetSuffexes']
  },
  tests: []
};

var count = 0;

read_stream.pipe(csv_parser).on('readable',function() {
  var record;
  while ((record = csv_parser.read()) !== undefined) {
    //console.log(record);
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
        coordinates: [ record.long, record.lat ]
      }
    };
    test_file_json.tests.push(test);
    count++;
  }
}).on('finish', function() {
  console.log(JSON.stringify(test_file_json, null, 2));
});


