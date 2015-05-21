var url = require('url'),
    config = require('pelias-config');

module.exports = function( uri ){

  var settings = config.generate();

  if( settings && settings.hasOwnProperty('mapzen') ){
    var host = url.parse( uri ).host;
    if( settings.mapzen.hasOwnProperty('api_key') && settings.mapzen.api_key.hasOwnProperty(host) ){
      return settings.mapzen.api_key[ host ];
    }
  }
  return null;
};
