var fs = require('fs');
var util = require('util');
var request = require('supertest');
var querystring = require('querystring');

var locations = require('./../test_cases/locations');
var testSuite = require('./../test_cases/search');

var errorFile = './errors-' + new Date() + '.json';

var url = 'http://pelias.mapzen.com';

describe(testSuite.name, function () {

  var _context = {
    errors: []
  };

  after(function (done) {
    fs.writeFile(errorFile, JSON.stringify(_context.errors, null, 2), done);
  });

  var id = 0;
  testSuite.tests.forEach(function (testCase) {
    it(util.format('[id:%s] query: %s (top %s)',
        id++, util.inspect(testCase.in), testCase.priorityThresh || testSuite.priorityThresh),
      _validateResults.bind(_context, testCase));
  });

});

function _validateResults(testCase, done) {
  var priorityThresh = testCase.priorityThresh || testSuite.priorityThresh;
  var expectedLocation = testCase.out;
  if ( typeof expectedLocation === 'string' ) {
    if( expectedLocation in locations ){
      expectedLocation = locations[expectedLocation];
    }
    else {
      process.nextTick( function (){
        var errMsg = util.format(
          'No `out` object matches `%s` in `locations.json`', expectedLocation
        );
        done( new Error( errMsg ) );
      });
      return;
    }
  }

  if( expectedLocation === null ){
    process.nextTick( function (){
      done( new Error( 'No `out` object specified.' ) );
    });
    return;
  }

  request(url)
    .get('/search?' + querystring.stringify(testCase.in))
    .expect('Content-Type', /json/)
    .expect(200)
    .end(function (err, res) {
      if (err) {
        done(err);
        return;
      }

      var error = new Error(
        'Expected result not in top ' + priorityThresh,
        {
          testCase: testCase,
          actualResults: res.body
        }
      );

      res.body.features.slice(0, priorityThresh).forEach(function (feature) {
        var match = true;
        for (var property in expectedLocation) {
          if (feature.properties[property] !== expectedLocation[property]) {
            match = false;
          }
        }
        if (match) {
          error = null;
        }
      });

      if (error) {
        this.errors.push({
          testCase: testCase,
          results: res.body.features.slice(0, priorityThresh)
        });
      }

      done(error);

    }.bind(this));
}
