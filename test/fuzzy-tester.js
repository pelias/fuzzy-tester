var tape = require( 'tape' );
var runTests = require( '../lib/run_tests' );

tape( 'execTestSuite() throws on bad test-cases.', function ( test ){
  test.throws( function (){
    var testSuite = {
      tests: [ { status: 'not a real status' } ]
    };
    runTests.execTestSuite( 'not a url', testSuite, null);
  }, /Invalid test status/, 'Throws exception on invalid test status.' );

  test.throws( function (){
    var testSuite = {
      tests: [{
        unexpected: {
          properties: [
            'a string?!'
          ]
        }
      }]
    };
    runTests.execTestSuite( 'not a url', testSuite, null);
  }, /MUST be objects/, 'Throws exception on non-object unexpected text-case.' );
  test.end();
});
