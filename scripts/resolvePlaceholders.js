var fs =  require('fs');
var path = require('path');
var request = require('sync-request');
var _ = require('lodash');

var fileName = process.argv[2];

function changeTestSuites(file) {
  if (fs.statSync(file).isDirectory()) {
    var files = fs.readdirSync(file);
    for (var i in files){
      var name = file + '/' + files[i];
      if (fs.statSync(name).isDirectory()){
        changeTestSuites(name);
      } else {
        changeTestSuite(name);
      }
    }
  }
  else {
    changeTestSuite(file);
  }
}

function changeTestSuite(file) {
  if (path.extname(file) !== '.json') {
    return;
  }
  const file_contents = fs.readFileSync(file);
  var json = JSON.parse(file_contents);

  json.tests = changeTestCases(json.tests);

  fs.writeSync(file, JSON.stringify(json, null, 2));
}

function changeTestCases(tests) {
  return tests.map(changeTest);
}

function changeTest(test) {
  if (typeof test.expected.properties === 'string') {
    var urlBase = 'http://search.mapzen.com/v1/search?api_key=search-DSuCnN0&text=';
    var res = request('get', urlBase + test.expected.properties);
    var json = JSON.parse(res.getBody());

    var first = json.features[0];

    if(first) {
      console.log(first.properties);

      var ignoredKeys = ['id', 'gid', 'layer', 'source', 'confidence'];

      var newValue = _.pickBy(first.properties, function(value, key) {
        return ignoredKeys.indexOf(key) === -1;
      });

      console.log(newValue);
      test.expected.properties = [newValue];
    }
  }
  return test;
}

changeTestSuites(fileName);
