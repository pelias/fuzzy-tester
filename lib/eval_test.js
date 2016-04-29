'use strict';

var scoreTest = require( '../lib/scoreTest' );
var sanitiseTestCase = require( '../lib/sanitiseTestCase' );
var isObject = require( 'is-object' );
var _ = require('lodash');
var supportedNormalizers = require('../lib/normalizers');
var compose = require('fj-compose');

function formatDiff(diff) {
  if (!diff) {
    return '';
  }

  // remove any extra nesting in the array
  while (_.isArray(diff) && diff.length === 1 && _.isArray(diff[0])) {
    diff = diff[0];
  }

  var output = diff.map(function(diff_part) {
    if (_.isString(diff_part)) {
      return '    ' + diff_part;
    }
    return '    ' + diff_part.property +
      '\n      expected: ' + diff_part.expected +
      '\n      actual:   ' + diff_part.actual;
  });

  return output.join('\n');
}

function formatTestErrors(score) {
  var message = 'score ' + score.score + ' out of ' + score.max_score;

  if (score.score < score.max_score) {
    message += '\n  diff:\n' + formatDiff(score.diff);
  }

  return message;
}

/**
 * Ensure the weights object is valid by filling in any missing
 * default values.
 */
function setDefaultWeights(weights) {
  weights = weights || {};
  weights.properties = weights.properties || {};
  weights.priorityThresh = weights.priorityThresh || 1;
  weights.unexpected = weights.unexpected || 1;
  weights.coordinates = weights.coordinates || 1;

  return weights;
}

/**
 * Combine a context passed in from a test suite with properties
 * from one individual test case to create the final context for this
 * test case. It handles locations, weights, normalizers,
 * distanceThresh and priorityThresh
 */
function makeTestContext( testCase, context ) {
  context.locations = context.locations || {};
  context.weights = setDefaultWeights(context.weights);

  if( 'expected' in testCase && 'priorityThresh' in testCase.expected ){
    context.priorityThresh = testCase.expected.priorityThresh;
  }
  if( 'expected' in testCase && testCase.expected.distanceThresh) {
    context.distanceThresh = testCase.expected.distanceThresh;
  }
  // copy normalizers, favoring individual testCase normalizers over
  // testSuite normalizers
  var propertyNormalizers = _.extend({}, context.normalizers, testCase.normalizers);

  for (var propertyNormalizer in propertyNormalizers) {
    if (_.isArray(propertyNormalizers[propertyNormalizer])) {
      // if the specified normalizers are a string array, compose a function out of them
      // that is, when normalizers are specified as: ['stripPunctuation', 'lowercase']
      //  then compose this function:
      //  lowercase(stripPunctuation(val))
      propertyNormalizers[propertyNormalizer] = composeNormalizer(
        propertyNormalizers[propertyNormalizer]);

    } else if (_.isString(propertyNormalizers[propertyNormalizer])) {
      // otherwise just look up the requested normalizer in the set of suppported normalizers
      propertyNormalizers[propertyNormalizer] =
        supportedNormalizers[propertyNormalizers[propertyNormalizer]];

    }

  }

  context.propertyNormalizers = propertyNormalizers;

  return context;
}

// Create a single function call from a list of functions
// For example, if the list of normalizers is [a, b, c], then
//  composeNormalizer creates a function that is the same as a(b(c(value)))
//
// The list must be reversed because compose iterates forward thru the array
//  whereas we want the original order to be maintained.  That is, if [a, b, c]
//  is specified,
//  we want: c(b(a(value))) to maintain the order specified
//  and not: a(b(c(value)))
//
// for reduce, the seed value is a function that just returns the input
function composeNormalizer(normalizers) {
  return normalizers.reverse().reduce(function(previousValue, currentValue) {
    if(!supportedNormalizers[currentValue]) {
      throw 'No normalizer called ' + currentValue + ' found';
    }
      return compose(previousValue, supportedNormalizers[currentValue]);
  }, supportedNormalizers.identity);

}

/**
 * Given a test-case, the API results for the input it specifies, and a
 * priority-threshold to find the results in, return an object indicating the
 * status of this test (whether it passed, failed, is a placeholder, etc.)
 */
function evalTest( testCase, apiResults, context ){
  context = _.clone(context, true);

  context = makeTestContext( testCase, context );

  testCase = sanitiseTestCase(testCase, context.locations);

  // on error, sanitiseTestCase returns an error message string
  if (typeof testCase === 'string') {
    return {
      result: 'placeholder',
      msg: testCase
    };
  }

  if ( !isObject(apiResults) || apiResults.length === 0 ) {
    return {
      result: 'fail',
      msg: 'no results returned'
    };
  }

  // normalize expected and actual properties in preparation for scoreTest
  testCase = normalizeExpected(testCase, context.propertyNormalizers);
  apiResults = normalizeActual(apiResults, context.propertyNormalizers);

  var score = scoreTest.scoreTest(testCase, apiResults, context);

  return {
    result: (score.score < score.max_score) ? 'fail' : 'pass',
    score: score.score,
    max_score: score.max_score,
    index: score.index,
    priorityThresh: score.priorityThresh,
    msg: formatTestErrors(score)
  };
}

function normalizeExpected(testCase, fieldNormalizers) {
  if (!hasAnArrayOfExpectedProperties(testCase)) {
    return testCase;
  }

  // normalize all expected properties that have normalizers
  testCase.expected.properties = testCase.expected.properties.map(function(obj) {
    Object.keys(obj).
      // find all properties with normalizers
      filter(function(key) {
        return fieldNormalizers[key];
      }).
      // apply normalizers
      forEach(function(key) {
        obj[key] = fieldNormalizers[key](obj[key]);
      });

    return obj;

  });

  return testCase;

}

function normalizeActual(apiResults, fieldNormalizers) {
  return apiResults.map(function(obj) {
    Object.keys(obj.properties).
      // find all properties with normalizers
      filter( function(key) {
        return fieldNormalizers[key];
      }).
      /// apply normalizers
      forEach( function(key) {
        obj.properties[key] = fieldNormalizers[key](obj.properties[key]);
      });

    return obj;

  });

}

function hasAnArrayOfExpectedProperties(testCase) {
  return testCase.hasOwnProperty('expected') &&
          testCase.expected.hasOwnProperty('properties') &&
          _.isArray(testCase.expected.properties);
}

module.exports = evalTest;
