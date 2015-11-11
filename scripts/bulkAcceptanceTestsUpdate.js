var fs = require('fs-extra');
var fileName = process.argv[2];
var extend = require('extend');
var path = require('path');

// config mapping of old names to new ones
var NAME_MAP = {
  'layer': 'type',
  'number': 'housenumber',
  'zip': 'postalcode',
  'alpha3': 'country_a',
  'admin0': 'country',
  'admin1': 'region',
  'admin1_abbr': 'region_a',
  'admin2': 'county',
  'local_admin': 'localadmin',
  'neighborhood': 'neighbourhood',
  'text': 'label'
};

var ENDPOINT_MAP = {
  'doc': 'place',
  'suggest': 'autocomplete',
  'suggest/nearby': 'autocomplete',
  'suggest/coarse': 'autocomplete',
  'search/coarse': 'search'
};

var META_MAP = {
  'geoname': { type: '???', source: 'gn' }, // TODO: not sure how to map. will need to use categories?
  'osmnode': { type: 'venue', source: 'osm' },
  'osmway': { type: 'venue', source: 'osm' },
  'admin0': { type: 'country', source: 'qs' },
  'admin1': { type: 'region', source: 'qs' },
  'admin2': { type: 'county', source: 'qs' },
  'neighborhood': { type: 'neighbourhood', source: 'qs' },
  'locality': { type: 'locality', source: 'qs' },
  'local_admin': { type: 'local_admin', source: 'qs' },
  'osmaddress': { type: 'address', source: 'osm' },
  'openaddresses': { type: 'address', source: 'oa' }
};

changeTestSuites(fileName);

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
  var json = fs.readJSONSync(file);
  json.tests = changeTestCases(json.tests);

  if (ENDPOINT_MAP.hasOwnProperty(json.endpoint)) {
    json.endpoint = ENDPOINT_MAP[json.endpoint];
  }

  fs.writeJsonSync(file, json);
}

function changeTestCases(tests) {
  return tests.map(function (test) {
    if (test.expected) {
      if (typeof test.expected.properties !== 'string') {
        test.expected.properties = test.expected.properties.map(function (exp) {
          return renameProperties(exp);
        });
      }
    }
    if (test.unexpected) {
      test.unexpected.properties = test.unexpected.properties.map(function (exp) {
        return renameProperties(exp);
      });
    }
    if (ENDPOINT_MAP.hasOwnProperty(test.endpoint)) {
      test.endpoint = ENDPOINT_MAP[test.endpoint];
    }
    return test;
  });
}

function renameProperties(place) {
  if (typeof place === 'string') {
    return place;
  }
  console.log(place);

  var newPlace = {};
  Object.keys(place).forEach(function (property) {
    if (property === 'address') {
      extend(newPlace, renameProperties(place[property]));
    }
    else {
      renameProperty(place, newPlace, property);
    }
  });

  // lookup mapping, or set both values to _type if not found
  var meta = META_MAP[place.layer] || {type: place.layer, source: place.layer};

  newPlace.type = meta.type;
  newPlace.source = meta.source;
  
  return newPlace;
}

function renameProperty(oldObj, newObj, property) {
  if (!oldObj.hasOwnProperty(property)) {
    return;
  }

  newObj[(NAME_MAP[property] || property)] = oldObj[property];
}
