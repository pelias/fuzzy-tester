
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
files.forEach( load );

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