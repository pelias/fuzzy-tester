
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
if( !files.length ){
  files = [
    '/var/www/pelias/acceptance-tests/test_cases/address_parsing.json',
    '/var/www/pelias/acceptance-tests/test_cases/address_type.json',
    '/var/www/pelias/acceptance-tests/test_cases/admin_lookup.json',
    '/var/www/pelias/acceptance-tests/test_cases/categories.json',
    '/var/www/pelias/acceptance-tests/test_cases/exact_matches.json',
    '/var/www/pelias/acceptance-tests/test_cases/landmarks.json',
    '/var/www/pelias/acceptance-tests/test_cases/params_details.json',
    '/var/www/pelias/acceptance-tests/test_cases/quattroshapes_popularity.json',
    '/var/www/pelias/acceptance-tests/test_cases/reverse_categories.json',
    '/var/www/pelias/acceptance-tests/test_cases/search_coarse.json',
    '/var/www/pelias/acceptance-tests/test_cases/search.json',
    '/var/www/pelias/acceptance-tests/test_cases/suggest_coarse.json',
    '/var/www/pelias/acceptance-tests/test_cases/suggest.json',
    '/var/www/pelias/acceptance-tests/test_cases/suggest_nearby.json'
  ].reverse();
}

files.forEach( load );
// load( '/var/www/pelias/acceptance-tests/test_cases/address_parsing.json' );