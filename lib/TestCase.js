
var merge = require('merge'),
    hash = require('object-hash');

var defaults = {
  options: {
    priorityThresh: 3
  },
  params: {
    baseUrl: 'http://pelias.mapzen.com',
    url: 'search',
    json: true
  }
};

function TestCase( name, options, params ){
  this.name = name;
  this.options = merge( true, defaults.options, options || {});
  this.params = merge( true, defaults.params, params || {} );
  this.tests = [];
}

TestCase.hash = function( obj ){
  return hash.sha1( obj ).substring(0,8);
};

TestCase.prototype.addTest = function( info, params, assertions ){
  var mergedParams = merge( true, this.params, params || {} );
  this.tests.push({
    hash: TestCase.hash( mergedParams ),
    info: info,
    params: mergedParams,
    assertions: assertions
  });
};

TestCase.fromJson = function( json ){
  
  if( !json.hasOwnProperty('name') ||
      !Array.isArray( json.tests ) ){
    throw new Error( 'invalid testcase json' );
  }

  var options = {};
  if( json.hasOwnProperty('priorityThresh') ){
    options.priorityThresh = json.priorityThresh;
  }

  var params = {};
  if( json.hasOwnProperty('endpoint') ){
    params.url = json.endpoint; // @todo: these properties are unintuitive
  }

  var testcase = new TestCase( json.name, options, params );

  json.tests.forEach( function( test ){

    var info = { user: test.user };
    var params = { qs: test.in };

    var assertions = {};
    if( test.hasOwnProperty('expected') ){
      assertions.expected = test.expected;
    }
    if( test.hasOwnProperty('unexpected') ){
      assertions.unexpected = test.unexpected;
    }

    if( test.hasOwnProperty('endpoint') ){
      params.url = test.endpoint; // @todo: these properties are unintuitive
    }

    testcase.addTest( info, params, assertions );
  });

  return testcase;
};

module.exports = TestCase;