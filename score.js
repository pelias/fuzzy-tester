
var TestCase = require('./lib/TestCase'),
    ScoringEngine = require('./lib/ScoringEngine'),
    LocalDataStore = require('./lib/LocalDataStore');

var store = new LocalDataStore({ path: './history.json' });
var engine = new ScoringEngine({ store: store });

function load( filename ){
  var file = require( filename );
  var testcase = TestCase.fromJson( file );

  console.log( '\n' + testcase.name );
  testcase.tests.forEach( function( test ){
    engine.score( test );
  });
}

var files = process.argv.slice(2);
files.forEach( load );