var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: '|', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var test_file_json = {
  name: 'HSL poi tests',
  description: 'A poi list in Helsinki region',
  source: 'digitransit@195.255.176.166/ftproot/rnj/poi.zip',
  priorityThresh: 1,
  normalizers: {
      name: [ 'toUpperCase', 'stripPunctuation','abbreviateDirectionals']
  },
};


var count = 0;

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var test = {
    id: count,
    status: 'pass',
    user: 'vesameskanen',
    in: {
	text: record.name + ',' + record.locality
//	boundary_circle_lat: 60.20,
//	boundary_circle_lon: 24.93,
//	boundary_circle_radius: 25
    },
    expected: {
      properties: [
        {
            name: record.name,
	    locality: record.locality
        }
      ]
    }
  };
  count++;
  this.push(test);
  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

var prefix = 'HslPoiTest';

importTestCases(prefix, test_file_json, full_stream, 10000);
