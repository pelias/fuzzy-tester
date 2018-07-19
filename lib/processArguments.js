var commander = require( 'commander' );
var fs = require( 'fs' );
var util = require( 'util' );
var peliasConfig = require( 'pelias-config' ).generate();
var path = require( 'path' );
var requireDir = require('require-dir');


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
  var endpointHelp = util.format(
    'The name of the Pelias API to target. Any of: %. Defaults to: prod',
    Object.keys(PELIAS_ENDPOINTS).join(', ')
  );

  var outputGeneratorHelp = util.format(
    'The type of output to generate. Any of: %s. Defaults to: terminal',
    outputGenerators.join( ', ' )
  );

  var filesHelp = 'The specific test-suite files to execute. ' +
    'If not specified, all files in ./test_cases will be run.';

  var noPassingHelp = 'If specified, details of all passing tests will be omitted from results';

  commander
  .usage( '[flags] [file(s)]' )
  .option(
    '-e, --endpoint <endpoint>',
    endpointHelp,
    'prod'
  )
  .option(
    '-r, --rate <int>',
    'The maxium number of requests per second (RPS) to allow',
    100
  )
  .option(
    '-o, --output <type>',
    outputGeneratorHelp,
    'terminal'
  )
  .option(
    '-t, --test-type <testType>',
    util.format( 'The type of tests to run, as specified in test-cases\' `type` property.' )
  )
  .option(
    '-q, --quiet',
    noPassingHelp,
    false
  )
  .option( 'files', filesHelp )
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

function getConfig() {
  var commander = setUpCommander();
  var apiUrl = getEndpointUrl(commander);
  var outputGenerator = getOutputGenerator(commander);
  var testSuites = getTestSuites();

  var config = {
    endpoint: {
      url: apiUrl,
      name: commander.endpoint
    },
    rate: commander.rate,
    outputGenerator: outputGenerator,
    testType: commander.testType,
    testSuites: testSuites,
    autocomplete: commander.output === 'autocomplete',
    quiet: commander.quiet
  };

  return config;
}

module.exports = {
  getOutputGenerators: getOutputGenerators,
  setUpCommander: setUpCommander,
  getConfig: getConfig
};
