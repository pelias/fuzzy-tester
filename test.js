/**
 * A tool for executing all of the `acceptance-tests` tests and formatting
 * their results into grokkable output.
 */

var colors = require( 'colors' ); // jshint ignore:line
var commander = require( 'commander' );
var requireDir = require( 'require-dir' );
var peliasConfig = require( 'pelias-config' ).generate();
var execTestSuites = require( './run_tests.js' );
var util = require( 'util' );

var path = require( 'path' );
var fs = require( 'fs' );
var OUTPUT_GENERATOR_DIR = 'output_generators';
var outputGenerators = fs.readdirSync( OUTPUT_GENERATOR_DIR )
  .reduce( function ( modules, nextFile ){
    if( nextFile.match( /.js$/ ) ){
      modules.push( nextFile.replace( /.js$/, '' ) );
    }
    return modules;
  }, []);

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
    .usage( '[flags] [file]' )
    .option(
      '-e, --endpoint <endpoint>',
      'The name of the Pelias API to target. Any of: ' + endpts, 'prod'
    )
    .option(
      '-o, --output <type>',
      util.format(
        'The type of output to generate. Any of: %s. Defaults to: terminal',
        outputGenerators.join( ', ' )
      ),
      'terminal'
    )
    .option(
      '-t, --test-type <testType>',
      util.format( 'The type of tests to run, as specified in test-cases\' `type` property.' )
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

  if( outputGenerators.indexOf( commander.output ) === -1 ){
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

  var outputGenerator = require( './' + path.join( OUTPUT_GENERATOR_DIR, commander.output ) );
  execTestSuites.exec( apiUrl, testSuites, outputGenerator, commander.testType );
})();
