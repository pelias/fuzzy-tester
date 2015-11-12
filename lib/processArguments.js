var commander = require( 'commander' );
var fs = require( 'fs' );
var util = require( 'util' );
var peliasConfig = require( 'pelias-config' ).generate();
var colors = require( 'colors' ); // jshint ignore:line
var path = require( 'path' );
var requireDir = require('require-dir');

var execTestSuites = require( '../lib/exec_test_suites.js' );

var OUTPUT_GENERATOR_DIR = __dirname + '/../output_generators';
var cwd = path.resolve(process.cwd());

var PELIAS_ENDPOINTS = peliasConfig[ 'acceptance-tests' ].endpoints;

function getOutputGenerators() {
  var outputGenerators = fs.readdirSync( OUTPUT_GENERATOR_DIR )
  .reduce( function ( modules, nextFile ){
    if( nextFile.match( /.js$/ ) ){
      modules.push( nextFile.replace( /.js$/, '' ) );
    }
    return modules;
  }, []);
  return outputGenerators;
}

var outputGenerators = getOutputGenerators();

function setUpCommander() {
  var endpointsString = Object.keys(PELIAS_ENDPOINTS).join(', ');
  commander
  .usage( '[flags] [file]' )
  .option(
    '-e, --endpoint <endpoint>',
    'The name of the Pelias API to target. Any of: ' + endpointsString, 'prod'
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

  return commander;
}

function getEndpointUrl(commander) {
  if( commander.endpoint in PELIAS_ENDPOINTS ){
    return PELIAS_ENDPOINTS[ commander.endpoint ].replace( /\/*$/, '' );
  }
  else {
    console.error(
      commander.endpoint + ' is not a recognized endpoint. Try: ',
      JSON.stringify( PELIAS_ENDPOINTS, undefined, 4 )
    );
    process.exit( 1 );
  }
}

function getOutputGenerator(commander) {
  if( outputGenerators.indexOf( commander.output ) === -1 ){
    console.error( commander.output + ' is not a recognized output generator.' );
    process.exit( 1 );
  }
  return require( path.join( OUTPUT_GENERATOR_DIR, commander.output ) );
}

function getTestSuites() {
  if( commander.args.length > 0 ){
    return commander.args.map( function ( filePath ){
      return require( path.resolve( filePath ) );
    });
  }
  else {
    var testFiles = requireDir( path.resolve(cwd, 'test_cases') );
    return Object.keys(testFiles).map(function(key) {
      return testFiles[key];
    });
  }
}

function runIt() {
  var commander = setUpCommander();
  var apiUrl = getEndpointUrl(commander);
  var outputGenerator = getOutputGenerator(commander);
  var testSuites = getTestSuites();
  execTestSuites( apiUrl, commander.endpoint, testSuites, outputGenerator, commander.testType );
}

module.exports = {
  getOutputGenerators: getOutputGenerators,
  setUpCommander: setUpCommander,
  runIt: runIt
};
