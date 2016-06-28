'use strict';

var tape = require( 'tape' );

var percentageForDisplay = require( '../lib/percentageForDisplay' );

tape( 'percentageForDisplay basics', function ( test ){
  test.test('all tests passed', function ( t ){
    var total_tests = 5;
    var passed_tests = 5;

    var actual = percentageForDisplay(total_tests, passed_tests);

    t.equal(actual, 100, 'output is 100%');

    t.end();
  });

  test.test('some tests passed', function ( t ){
    var total_tests = 5;
    var passed_tests = 3;

    var actual = percentageForDisplay(total_tests, passed_tests);

    t.equal(actual, 60, 'output is 60%');

    t.end();
  });

  test.test('approaching 100%', function(t){
  	var total_tests = 10000;
  	var passed_tests = 9997;

  	var actual = percentageForDisplay(total_tests,passed_tests);

  	t.equal(actual,99.97, 'output is 99.97%');
  	t.end();
  });

  test.test('repeating decimals', function(t){
  	var total_tests = 3;
  	var passed_tests = 2;
  	
  	var actual = percentageForDisplay(total_tests,passed_tests);

  	t.equal(actual, 66.67, 'output is 66.67%');
  	t.end();
  });

  test.test('no tests', function ( t ){
    var total_tests = 0;
    var passed_tests = 0;

    var actual = percentageForDisplay(total_tests, passed_tests);

    t.equal(actual, 0, 'output is 0%');

    t.end();
  });  
});