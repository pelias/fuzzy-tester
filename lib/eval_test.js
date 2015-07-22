'use strict';

var scoreTest = require( '../lib/scoreTest' );
var isObject = require( 'is-object' );

/**
 * Given the properties of a test case,
 * construct the actual expected object.
 * This simply acounts for pre-defiend locations for now
 */
function constructExpectedOutput(properties, locations) {
  // some tests don't have a properties array, but this is easy to fix
  if (typeof properties === 'string') {
    properties = [properties];
  }

  return properties.map(function(property) {
    if ( typeof property === 'string' && property in locations ) {
      return locations[property];
    // this intentionally leaves unmatched location strings as strings
    // that way it is possible to go back and look for them later
    } else {
      return property;
    }
  });
}

/**
 * Find unmatched location strings left from running constructExpectedOutput
 */
function findPlaceholders(expected) {
  return expected.filter(function(item) {
    return typeof item === 'string';
  });
}

function formatTestErrors(score) {
  return 'score ' + score.score + ' out of ' + score.max_score +
    '\ndiff: ' + JSON.stringify(score.diff, null, 2);
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

  if( 'expected' in testCase ){
    testCase.expected.properties = constructExpectedOutput(testCase.expected.properties, locations);

    if( 'priorityThresh' in testCase.expected ){
      priorityThresh = testCase.expected.priorityThresh;
    }

    var missed_locations = findPlaceholders(testCase.expected.properties);
    if (missed_locations.length > 0) {
      return {
        result: 'placeholder',
        msg: 'Placeholder: no matches for ' + missed_locations.join(', ') + ' in `locations.json`.'
      };
    }
  }

  var score = scoreTest(testCase, apiResults, priorityThresh);

  if (score.score < score.max_score) {
    return {
      result: 'fail',
      msg: formatTestErrors(score)
    };
  }

  return {
    result: 'pass',
    msg: 'score ' + score.score + '/' + score.max_score
  };
}

module.exports = evalTest;
