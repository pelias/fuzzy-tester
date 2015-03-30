/**
 * A tool for executing all of the `acceptance-tests` tests and formatting
 * their results into grokkable output.
 */

var colors = require( 'colors' ); // jshint ignore:line
var commander = require( 'commander' );
var requireDir = require( 'require-dir' );
var peliasConfig = require( 'pelias-config' ).generate();
var outputGenerators = requireDir( './output_generators' );
var execTestSuites = require( './run_tests.js' );
var util = require( 'util' );

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
  var generators = Object.keys( outputGenerators );
  commander
    .usage( '[flags] [file]' )
    .option(
      '-e, --endpoint <endpoint>',
      'The name of the Pelias API to target. Any of: ' + endpts, 'prod'
    )
    .option(
      '-o, --output <type>',
      util.format(
        'The type of output to generate. Any of: %s. Defaults to: terminal',
        generators.join( ', ' )
      ),
      'terminal'
    )
    .option( 'file', 'The specific test-suite to execute instead of all of them.' )
    .parse( process.argv );

  var apiUrl;
  if( commander.endpoint in PELIAS_ENDPOINTS ){
    apiUrl = PELIAS_ENDPOINTS[ commander.endpoint ].replace( /\/*$/, '' );
  }
  else {
    console.error(
      commander.endpoint + ' is not a recognized endpoint. Try: ',
      JSON.stringify( PELIAS_ENDPOINTS, undefined, 4 )
    );
    process.exit( 1 );
  }

  if( generators.indexOf( commander.output ) === -1 ){
    console.error( commander.output + ' is not a recognized output generator.' );
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

  execTestSuites.exec( apiUrl, testSuites, outputGenerators[ commander.output ] );
})();
