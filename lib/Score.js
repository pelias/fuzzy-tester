
var SHOW_HISTORY = 10;

function Score( testcase, history ){
  this.testcase = testcase;
  this.history = history;
  this.assertions = [];

  this.status = Score.status.UNKNOWN;
}

Score.status = {
  SAME:           620,
  WORSE:          621,
  BETTER:         622,
  FAIL:           700,
  NO_ASSERTIONS:  710,
  UNKNOWN:        799
};

Score.prototype.assertEach = function( cb ){

  this.assertions = [];
  
  if( this.history && this.history.results ){

    var chronology = Object.keys( this.history.results )
      .sort()
      .reverse()
      .slice( 0, SHOW_HISTORY );

    chronology.forEach( function( time ){
      var transaction = this.history.results[time];
      if( !transaction ){
        this.assertions.push( Score.status.UNKNOWN );
      } else {
        this.assertions.push( cb( transaction ) || Score.status.UNKNOWN );
      }
    }, this);
  }

  this.status = Score.statusOf( this.assertions );
};

Score.statusOf = function( assertions ){

  if( !assertions || !assertions.length ){
    return Score.status.NO_ASSERTIONS;
  }

  var currentStatus = assertions[0];
  var lastStatus = assertions[1] || currentStatus;

  if( currentStatus === lastStatus ){
    // same
    return Score.status.SAME;
  } else if( currentStatus > lastStatus ){
    if( currentStatus > 399 ){
      // hiccup
      return Score.status.SAME;
    }
    // regression
    return Score.status.WORSE;
  } else if( currentStatus < lastStatus ){
    if( lastStatus > 399 ){
      // resolve hiccup
      return Score.status.SAME;
    }
    // improvement
    return Score.status.BETTER;
  }

  return Score.status.UNKNOWN;

};

module.exports = Score;