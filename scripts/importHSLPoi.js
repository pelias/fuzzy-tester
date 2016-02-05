var csv_parse = require('csv-parse');
var fs = require('fs');
var through = require('through2');

var importTestCases = require('./testCaseImporter');

var csv_parser = csv_parse({ delimiter: '|', columns: true});
var filename = process.argv[2];
var read_stream = fs.createReadStream(filename);

var proj4 = require('proj4');
proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
  ],
  [
    'EPSG:2392', //# KKJ / Finland zone 2
    '+proj=tmerc +lat_0=0 +lon_0=24 +k=1 +x_0=2500000 +y_0=0 +ellps=intl ' +
    '+towgs84=-96.0617,-82.4278,-121.7535,4.80107,0.34543,-1.37646,1.4964 +units=m +no_defs'
  ]
]);

var test_file_json = {
  name: 'HSL poi tests',
  description: 'A poi list in Helsinki region',
  source: 'digitransit@195.255.176.166/ftproot/rnj/poi.zip',
  priorityThresh: 1,
  normalizers: {
      name: [ 'toUpperCase', 'removeNumbers']
  },
};


var count = 0;

var testCaseStream = through({objectMode: true}, function(record, encoding, callback) {
  var test = {
    id: count,
    status: 'pass',
    user: 'vesameskanen',
    in: {
    text: record.name + ', ' + record.locality
//    focus not needed - names are surely unique within locality
//    focus_point_lat: 60.20,
//    focus_point_lon: 24.93
    },
    expected: {
      properties: [
        {
        // enable name property for strict name comparison instead of coordinate matching
        // name: record.name,
          locality: record.locality
        }
      ],
      coordinates: [
        proj4('EPSG:2392','EPSG:4326',[record.xpos, record.ypos])
      ]
    }
  };
  count++;
  this.push(test);
  callback();
});

var full_stream = read_stream.pipe(csv_parser).pipe(testCaseStream);

var prefix = 'HslPoiTest';

importTestCases(prefix, test_file_json, full_stream, 5000);
