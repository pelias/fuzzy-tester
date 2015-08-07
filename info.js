
var LocalDataStore = require('./lib/LocalDataStore');
var store = new LocalDataStore({ path: './history.json' });

function find( hash ){
  var hit = store.get( hash );
  if( !hit ){
    return console.error( 'not found!' );
  }
  console.log( JSON.stringify( hit, null, 2 ) );
}

process.argv.slice(2).forEach( find );