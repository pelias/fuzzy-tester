
var TestCase = require('./lib/TestCase'),
    HttpClient = require('./lib/HttpClient'),
    LocalDataStore = require('./lib/LocalDataStore');

var report = require('./lib/reporter/status');

var client = new HttpClient();

function load( filename ){
  var file = require( filename );
  var testcase = TestCase.fromJson( file );

  testcase.tests.forEach( function( test ){
    client.enqueue(test.params);
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

var store = new LocalDataStore({ path: './history.json' });
client.on( 'transaction', store.put.bind( store ) );
client.fetch();

// reporter
client.on( 'transaction', function( transaction ){
  report( transaction.status );
});

client.on( 'done', function(){
  process.stdout.write('\n');
});