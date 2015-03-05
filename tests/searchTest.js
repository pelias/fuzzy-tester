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

/**
 * Resolve a test-case's `out` property to an object of expected property
 * values, to be tested against API return results.
 *
 * @param {string|null} expectedLocation The `out` property as found in a test
 *    case in `test_cases/`.
 * @return {error|object} An Error if the `out` could not be resolved to an
 *    object; otherwise, the object.
 */
function getExpectedLocation( expectedLocation ){
  if ( typeof expectedLocation === 'string' ) {
    if( expectedLocation in locations ){
      return locations[expectedLocation];
    }
    else {
      var errMsg = util.format(
        'No `out` object matches `%s` in `locations.json`', expectedLocation
      );
      return new Error( errMsg );
    }
  }
  else if( expectedLocation === null ){
    return new Error( 'No `out` object specified.' );
  }
  else {
    return expectedLocation;
  }
}

function _validateResults(testCase, done) {
  var priorityThresh = testCase.priorityThresh || testSuite.priorityThresh;
  var expectedLocation = getExpectedLocation( testCase.out );
  if( expectedLocation instanceof Error ){
    process.nextTick( function (  ){
      done( expectedLocation );
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
