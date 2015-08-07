
// var HttpClient = require('./HttpClient'),
//     LocalDataStore = require('./LocalDataStore');

// function Suite(){
//   this._cases = [];
// }

// Suite.prototype.add = function( testcase ){
//   this._cases.push( testcase );
// };

// Suite.prototype.fetch = function( client, cb ){
//   this._queue.forEach( function( testcase ){
//     client.enqueue({ qs: testcase.req });
//   });

//   client.fetch( cb );
// };

// Suite.prototype.persist = function( engine, cb ){
//   this._queue.forEach( function( testcase ){
//     client.enqueue({ qs: testcase.req });
//   });

//   client.fetch( cb );
// };

// module.exports = Suite;