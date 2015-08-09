
var equalProperties = require('../equal_properties' );

// cycle through each dict in the dicts array until a
// match is found then return true, else return false

function obj_scorer( dicts, features, attr ){
  // attr eg. properties
  var plan = dicts.length, pass = 0;
  dicts.forEach( function( dict ){
    for( var i in features ){
      var feature = features[i];

      // console.log( dict, feature.properties );
      var assert = equalProperties( dict, feature[attr] );
      if( assert ){ pass++; break; }
    }
  });
  return pass === plan;
}

// cycle through all keys in the expected array ensuring
// all keys are present in all features

function key_scorer( keys, features, attr, expectedValue ){
  var plan = 0, pass = 0;
  features.forEach( function( feature ){
    keys.forEach( function( key ){
      plan++;
      if( expectedValue === feature[attr].hasOwnProperty( key ) ){
        pass++;
      }
    });
  });
  return pass === plan;
}

module.exports.key = key_scorer;
module.exports.obj = obj_scorer;