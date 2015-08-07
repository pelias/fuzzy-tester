
var fs = require('fs'),
    path = require('path');

var naivedb = require('naivedb');
var TestCase = require('./TestCase');

function LocalDataStore( opts ){
  this.opts = opts;
  this.db = null;
  this.open();
}

LocalDataStore.prototype.put = function( transaction ){
  var hash = TestCase.hash( transaction.query ),
      hit = this.db.get( hash );
  
  // initialize query in db
  if( !hit ){
    hit = { query: transaction.query, results: {} };
  }

  // add transaction to db  
  hit.results[ transaction.time ] = {
    status: transaction.status,
    res: transaction.res,
    err: transaction.err
  };

  this.db.set( hash, hit );
};

LocalDataStore.prototype.get = function( hash ){
  return this.db.get( hash );
};

LocalDataStore.prototype.open = function(){
  var dbpath = path.resolve( this.opts.path );
  if( !fs.existsSync( dbpath ) ){
    fs.writeFileSync( dbpath, '{}' ); // initdb
  }
  try {
    this.db = naivedb( dbpath );
  } catch( e ) {
    throw new Error( 'invalid json: ' + dbpath );
  }
};

module.exports = LocalDataStore;