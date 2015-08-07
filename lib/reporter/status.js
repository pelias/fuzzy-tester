
var Score = require('../Score');

module.exports = function( status, dontPrint ){

  var result;
  
  switch( status ){
    case 200:
    case 201: result = '·'; break;
    case 408: result = 'T'; break; //timeout 
    case 429: result = 'R'; break; //ratelimit
    case Score.status.SAME: result = '-'; break;
    case Score.status.WORSE: result = '▼'; break;
    case Score.status.BETTER: result = '▲'; break;
    case Score.status.FAIL: result = 'F'; break;
    default: result = '?'; break;
    //process.stdout.write( '' + Math.floor( status / 100 ) );
  }

  if( !dontPrint ){
    process.stdout.write( result );
  }

  return result;
};