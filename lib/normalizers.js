var _ = require('lodash');

module.exports = {};

// don't remove this, it's used for composing functions in eval_test
module.exports.identity = function(val) {
  return val;
};

module.exports.stripPunctuation = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  // remove anything that's not a letter, number, underscore, or whitespace
  return val.replace(/[^\w\s]/g, '');

};

module.exports.toLowerCase = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  return val.toLowerCase();

};

module.exports.toUpperCase = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  return val.toUpperCase();

};

module.exports.abbreviateDirectionals = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  var directionals = {
    'NORTH': 'N',
    'SOUTH': 'S',
    'EAST': 'E',
    'WEST': 'W',
    'NORTHEAST': 'NE',
    'NORTHWEST': 'NW',
    'SOUTHEAST': 'SE',
    'SOUTHWEST': 'SW'
  };

  return replaceTerms(val, directionals, 'gi');

};

module.exports.abbreviateStreetSuffexes = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  var terms = {
    'STREET': 'ST',
    'AVENUE': 'AVE',
    'BOULEVARD': 'BLVD',
    'ROAD': 'RD'
  };

  return replaceTerms(val, terms, 'gi');
};

module.exports.removeOrdinals = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  return val.replace(/((\d+)(st|nd|th|rd))/ig, '$2');
};

module.exports.abbreviateMountSaintFort = function(val) {
  if (!_.isString(val)) {
    return val;
  }

  var terms = {
    'MOUNT': 'Mt',
    'SAINT': 'St',
    'FORT': 'Ft'
  };

  return replaceTerms(val, terms, 'gi');

};

// starting with the input value, case-insensitively replace all original
//  originals with replacments
function replaceTerms(val, terms, flags) {
  return Object.keys(terms).reduce( function(previousValue, original) {
    var regexp = new RegExp('\\b' + original + '\\b', flags);
    var replacment = terms[original];

    return previousValue.replace(regexp, replacment);

  }, val);

}
