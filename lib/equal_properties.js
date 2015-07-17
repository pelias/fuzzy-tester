'use strict';
/**
 * Return a boolean indicating whether `actual` has all the key value pairs
 * contained in `expected`.
 */
function equalProperties( expected, actual ){
  for( var prop in expected ){
    if ( typeof expected[ prop ] !== typeof actual[ prop ] ) {
      return false;
    }

    if ( typeof expected[ prop ] === 'object' ) {
      return equalProperties( expected[ prop ], actual[ prop ] );
    }

    if( actual[ prop ] !== expected[ prop ] ){
      return false;
    }
  }
  return true;
}

module.exports = equalProperties;
