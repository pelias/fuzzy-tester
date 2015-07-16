'use strict';

var equalProperties = require( '../lib/equal_properties' );
var isObject = require( 'is-object' );
var util = require( 'util' );

/**
 * Given the properties of a test case,
 * construct the actual expected object.
 * This simply acounts for pre-defiend locations for now
 */
function constructExpectedOutput(properties, locations) {
  return properties.map(function(property) {
    if ( typeof property === 'string' && property in locations ) {
      return locations[property];
    } else {
      return property;
    }
  });
}

function findPlaceholders(expected) {
  return expected.filter(function(item) {
    return typeof item === 'string';
  });
}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( priorityThresh, testCase, apiResults, locations ){
  locations = locations || {};

  if( (!( 'expected' in testCase ) || testCase.expected.properties === null) &&
      !( 'unexpected' in testCase ) ){
    return {
      result: 'placeholder',
      msg: 'Placeholder test, no `expected` specified.'
    };
  }

  if ( !isObject(apiResults) || apiResults.length === 0 ) {
    return {
      result: 'fail',
      msg: 'no results returned'
    };
  }

  var expected = [];
  if( 'expected' in testCase ){
    expected = constructExpectedOutput(testCase.expected.properties, locations);

    if( 'priorityThresh' in testCase.expected ){
      priorityThresh = testCase.expected.priorityThresh;
    }

    var missed_locations = findPlaceholders(expected);
    if (missed_locations.length > 0) {
      return {
        result: 'placeholder',
        msg: 'Placeholder: no matches for ' + missed_locations.join(', ') + ' in `locations.json`.'
      };
    }
  }

  var unexpected = ( testCase.hasOwnProperty( 'unexpected' ) ) ?
    testCase.unexpected.properties : [];

  var expectedResultsFound = [];

  for( var ind = 0; ind < apiResults.length; ind++ ){
    var result = apiResults[ ind ];
    for( var expectedInd = 0; expectedInd < expected.length; expectedInd++ ){
      if( expectedResultsFound.indexOf( expectedInd ) === -1 &&
        equalProperties( expected[ expectedInd ], result.properties ) ){
        var success = ( ind + 1 ) <= priorityThresh;
        if( !success ){
          return {
            result: 'fail',
            msg: util.format( 'Result found, but not in top %s. (%s)', priorityThresh, ind+1 )
          };
        }
        else {
          expectedResultsFound.push( expectedInd );
        }
      }
    }

    for( var unexpectedInd = 0; unexpectedInd < unexpected.length; unexpectedInd++ ){
      if( equalProperties( unexpected[ unexpectedInd ], result.properties ) ){
        return {
          result: 'fail',
          msg: util.format( 'Unexpected result found.' )
        };
      }
    }
  }

  if ( expectedResultsFound.length === expected.length ) {
    return { result: 'pass' };
  }

  if ( expected.length === 0 && unexpected.length > 0 ) {
    return {result: 'pass'};
  }

  return {
      result: 'fail',
      msg: 'No matching result found.'
    };
}

module.exports = evalTest;
