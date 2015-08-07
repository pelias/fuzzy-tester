
var EventEmitter = require('events').EventEmitter,
    limit = require('simple-rate-limiter'),
    request = require('request'),
    merge = require('merge'),
    util = require('util');

function HttpClient( transport, options ){
  EventEmitter.call(this);
  this._queries = [];
  this._transactions = [];
  this.on( 'response', this._transaction.bind(this) );
  this.options = merge( true, { throttle: 3 }, options || {} );

  // configure rate limiter
  this.transport = transport || limit(request)
    .to(this.options.throttle)
    .per(1200);
}

util.inherits( HttpClient, EventEmitter );

HttpClient.prototype.enqueue = function( query ){
  this._queries.push( query );
  this.emit( 'enqueue', query );
};

HttpClient.prototype._request = function( query ){
  this.emit( 'request', query );
  this.transport( query, function( err, res, body ){
    this.emit( 'response', query, err, res, body );
  }.bind(this));
};

HttpClient.prototype._transaction = function( query, err, res, body ){
  var transaction = {
    status: res && res.statusCode || 900,
    query: query,
    err: err,
    res: res,
    body: body,
    time: new Date().getTime()
  };
  this._transactions.push(transaction);
  this.emit( 'transaction', transaction );
  if( this._transactions.length === this._queries.length ){
    this.emit( 'done', this._transactions );
  }
};

HttpClient.prototype.fetch = function(){
  this._transactions = []; // reset
  this._queries.forEach( this._request.bind(this) );
};

module.exports = HttpClient;