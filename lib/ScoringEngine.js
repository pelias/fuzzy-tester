

var Score = require('./Score' );
var report = require('./reporter/score' );
var equality = require('./scorer/equality' );

function ScoringEngine( config ){
  this.store = config.store;
}

ScoringEngine.prototype.score = function( testcase ){
  
  var score = new Score( testcase, this.store.get( testcase.hash ) );

  score.assertEach( function( transaction ){

    var body = transaction.res.body;
    var plan = 0, pass = 0, attr;

    var assertionTypes = {
      expected:   true,
      unexpected: false
    };

    for( var type in assertionTypes ){
      if( testcase.assertions.hasOwnProperty(type) ){
        var expectedValue = assertionTypes[type];
        for( attr in testcase.assertions[type] ){
          // attr eg. properties

          var expected = testcase.assertions[type][attr];
          plan++;
          
          if( body && body.features ){
            var s = attr.split(':');
            if( s.length === 1 ){
              if( expectedValue === equality.obj( expected, body.features, s[0] ) ){
                pass++;
              }
            }
            if( s.length === 2 && s[0] === 'keys' ){
              if( equality.key( expected, body.features, s[1], expectedValue ) ){
                pass++;
              }
            }
          }
        }
      }
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