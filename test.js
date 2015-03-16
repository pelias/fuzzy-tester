/**
 * A tool for executing all of the `acceptance-tests` tests and formatting
 * their results into grokkable output.
 */

var colors = require( 'colors' );
var commander = require( 'commander' );
var requireDir = require( 'require-dir' );
var peliasConfig = require( 'pelias-config' ).generate();
var terminalOutputGenerator = require( './output_generators/terminal.js' );
var execTestSuites = require( './run_tests.js' );

/**
 * URLs for the various Pelias APIs out in the wild. Can be specified as a
 * command-line argument (see `runTests()`).
 */
var PELIAS_ENDPOINTS = peliasConfig[ 'acceptance-tests' ].endpoints;

/**
 * Parse command-line arguments and execute indicated test-suites.
 */
(function runTests(){
  var endpts = Object.keys( PELIAS_ENDPOINTS ).join( ', ' );
  commander
    .option(
      '-e, --endpoint <endpoint>',
      'The name of the Pelias API to target. Any of: ' + endpts, 'prod'
    )
    .parse( process.argv );

  var apiUrl;
  if( commander.endpoint in PELIAS_ENDPOINTS ){
    apiUrl = PELIAS_ENDPOINTS[ commander.endpoint ];
  }
  else {
    console.error(
      commander.endpoint + ' is not a recognized endpoint. Try: ',
      JSON.stringify( PELIAS_ENDPOINTS, undefined, 4 )
    );
    process.exit( 1 );
  }

  var testSuites;
  if( commander.args.length > 0 ){
    testSuites = commander.args.map( function ( filePath ){
      return require( './' + filePath );
    });
  }
  else {
    var testFiles = requireDir( 'test_cases' );
    testSuites = [];
    for( var file in testFiles ){
      testSuites.push( testFiles[ file ] );
    }
  }

  execTestSuites.exec( apiUrl, testSuites, terminalOutputGenerator );
})();
