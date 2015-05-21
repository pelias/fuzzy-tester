var apiKey = require( '../lib/apiKey' );
var fs = require( 'fs' );
var tape = require( 'tape' );

tape( 'api_key not found in config', function ( test ){

  var config = '{}';

  // write a temporary pelias config
  fs.writeFileSync( '/tmp/pelias_temp.json', config, 'utf8' );

  // set the PELIAS_CONFIG env var
  process.env.PELIAS_CONFIG = '/tmp/pelias_temp.json';

  // staging
  test.equal( apiKey( 'http://pelias.stage.mapzen.com/foo' ), null, 'api key not found' );

  // unset the PELIAS_CONFIG env var
  delete process.env.PELIAS_CONFIG;

  // delete temp file
  fs.unlink( '/tmp/pelias_temp.json' );

  test.end();
});

tape( 'stage api_key imported from pelias config', function ( test ){

  var config = '{ "mapzen": { "api_key": { "pelias.stage.mapzen.com": "my_api_key" } } }';

  // write a temporary pelias config
  fs.writeFileSync( '/tmp/pelias_temp2.json', config, 'utf8' );

  // set the PELIAS_CONFIG env var
  process.env.PELIAS_CONFIG = '/tmp/pelias_temp2.json';

  // staging
  test.equal( apiKey( 'http://pelias.stage.mapzen.com/foo' ), 'my_api_key', 'api key loaded' );

  // unset the PELIAS_CONFIG env var
  delete process.env.PELIAS_CONFIG;

  // delete temp file
  fs.unlink( '/tmp/pelias_temp2.json' );

  test.end();
});

tape( 'avoid matching partial urls', function ( test ){

  var config = '{ "mapzen": { "api_key": { "pelias.stage.mapzen.com": "my_api_key" } } }';

  // write a temporary pelias config
  fs.writeFileSync( '/tmp/pelias_temp3.json', config, 'utf8' );

  // set the PELIAS_CONFIG env var
  process.env.PELIAS_CONFIG = '/tmp/pelias_temp3.json';

  // staging
  test.equal( apiKey( 'http://mapzen.com/foo' ), null, 'api not found' );

  // unset the PELIAS_CONFIG env var
  delete process.env.PELIAS_CONFIG;

  // delete temp file
  fs.unlink( '/tmp/pelias_temp3.json' );

  test.end();
});
