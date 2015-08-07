
var equalProperties = require('./equal_properties' );
var Score = require('./Score' );
var report = require('./reporter/score' );

function ScoringEngine( config ){
  this.store = config.store;
}

ScoringEngine.prototype.score = function( testcase ){
  
  var score = new Score( testcase, this.store.get( testcase.hash ) );

  score.assertEach( function( transaction ){

    var body = transaction.res.body;
    var plan = 0, pass = 0;

    if( testcase.assertions.hasOwnProperty('expected') ){

      var expected = testcase.assertions.expected.properties;
      plan += expected.length;

      expected.forEach( function( properties ){
        if( body && body.features ){
          for( var i in body.features ){
            var feature = body.features[i];

            // console.log( properties, feature.properties );
            var assert = equalProperties( properties, feature.properties );
            if( assert ){
              pass++;
              break;
            }
          }
        }
      });
    }

    if( testcase.assertions.hasOwnProperty('unexpected') ){

      var unexpected = testcase.assertions.unexpected.properties;
      plan += unexpected.length;

      unexpected.forEach( function( properties ){
        if( body && body.features ){
          for( var i in body.features ){
            var feature = body.features[i];

            // console.log( properties, feature.properties );
            var assert = equalProperties( properties, feature.properties );
            if( !assert ){
              pass++;
              break;
            }
          }
        }
      });
    }

    // service failure
    if( transaction.status > 299 ){
      return transaction.status;
    }

    // no assertions run
    else if( plan === 0 ) {
      return Score.status.NO_ASSERTIONS;
    }
    
    // some assertions failed
    if( pass !== plan ){
      return Score.status.FAIL;
    }

    return transaction.status;
  });

  // reporter
  report( score );
};

module.exports = ScoringEngine;