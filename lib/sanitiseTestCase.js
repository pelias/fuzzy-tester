'use strict';
const _ = require('lodash');
/**
 * Given the properties of a test case,
 * construct the actual expected object.
 * This simply acounts for pre-defiend locations
 */
function constructExpectedOutput(properties, locations) {
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

/**
 * some tests don't have a properties array, if the properties
 * object is just a single string, turn it into a one element
 * array. Also, a single object must be wrapped into an array.
 */
function normalizeProperties(properties) {
  if (typeof properties === 'string') {
    properties = [properties];
  } else if (!Array.isArray(properties)) { // wrap single object into an array
    properties = [properties];
  }
  return properties;
}

/**
 * For convenioence, allow a single pair of coordinates
 * instead of a list of expected coordinate pairs.
 * accept also an object with lon, lat
 */
function normalizeCoordinates(coordinates) {
  if (Array.isArray(coordinates) && coordinates.length>0) {
    if (!Array.isArray(coordinates[0])) {
      coordinates = [coordinates];
    }
  } else if (typeof coordinates === 'object' && coordinates !== null && coordinates.lon && coordinates.lat) {
    coordinates = [coordinates.lon, coordinates.lat];
  }

  return coordinates;
}

function normalizeSize(size) {
  return _.isNumber(size) ? size.toString() : size;
}

function sanitiseTestCase(testCase, locations) {
  locations = locations || {};

  if (!testCase.expected && !testCase.unexpected) {
    return 'Placeholder test: no `expected` or `unexpected` given';
  }

  if (testCase.expected) {
    if (!testCase.expected.properties) {
      return 'Placeholder test: `expected` block is empty';
    }

    testCase.expected.properties = normalizeProperties(testCase.expected.properties);
    testCase.expected.properties = constructExpectedOutput(testCase.expected.properties, locations);

    if(testCase.expected.coordinates) {
      testCase.expected.coordinates = normalizeCoordinates(testCase.expected.coordinates);
    }

    var unmatched_placeholders = findPlaceholders(testCase.expected.properties);
    if (unmatched_placeholders.length > 0) {
      return 'Placeholder: no matches for ' + unmatched_placeholders.join(', ') + ' in `locations.json`.';
    }
    if (!_.isNil(testCase.expected.size)) {
      testCase.expected.size = normalizeSize(testCase.expected.size);
    }
  }

  return testCase;
}

module.exports = sanitiseTestCase;
