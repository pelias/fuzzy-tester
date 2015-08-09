
var report = require('./status');

// stringify 'input' param first
var _stringify = require('json-stable-stringify');
var stringify = function( obj ){
  return _stringify( obj, function (a, b) {
    if( a.key === 'input' ){ return -1; }
    if( b.key === 'input' ){ return  1; }
    return a.key < b.key ? 1 : -1;
  });
};

module.exports = function( score ){

  process.stdout.write( ' ' + report( score.status, true ) + ' ' );
  process.stdout.write( '[' + score.testcase.hash + '] ' );

  if( !score.assertions.length ){
    report( 999 );
  } else {
    score.assertions.forEach( function( status ){
      report( status );
    });
  }

  process.stdout.write(' ' + stringify( score.testcase.params.qs ) );
  process.stdout.write(' /' + score.testcase.params.url );
  process.stdout.write('\n');

};