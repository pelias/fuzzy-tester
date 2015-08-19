'use strict';

var tape = require( 'tape' );

var scoreProperties = require( '../lib/scoreProperties' );

tape( 'scoreProperties basics', function ( test ){

  test.test('single matching primitive', function ( t ){
    var expectation = 'a string';
    var result = 'a string';

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 1, 'max score equals 1');
    t.equal(score_result.score, 1, 'score equals 1');

    t.end();
  });

  test.test('single unmatching primitive', function ( t ){
    var expectation = 'a string';
    var result = 'a different string';

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 1, 'max score equals 1');
    t.equal(score_result.score, 0, 'score equals 0');

    t.end();
  });

  test.test('object with single matching primitive property', function ( t ){
    var expectation = { foo: 'a string' };
    var result = { foo: 'a string' };

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 1, 'max score equals 1');
    t.equal(score_result.score, 1, 'score equals 1');

    t.end();
  });

  test.test('object with single mismatching primitive property', function ( t ){
    var expectation = { foo: 'a string' };
    var result = { foo:'a different string' };

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 1, 'max score equals 1');
    t.equal(score_result.score, 0, 'score equals 0');

    t.end();
  });

  test.test('object with matching and mismatching properties', function ( t ) {
    var expectation = { foo: 'a string', bar: 'another string' };
    var result = { foo:'a different string', bar: 'another string' };

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 2, 'max score equals 2');
    t.equal(score_result.score, 1, 'score equals 1');

    t.end();
  });

  test.test('object with nested object and matching properties', function ( t ) {
    var expectation = { foo: 'a string', bar: { baz: 'another string' } };
    var result = { foo:'a string', bar: { baz: 'another string' } };

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 2, 'max score equals 2');
    t.equal(score_result.score, 2, 'score equals 2');

    t.end();
  });

  test.test('object with nested object and matching and mismatching properties', function ( t ) {
    var expectation = { foo: 'a string', bar: { baz: 'another string', wrong: 'expected value' } };
    var result = { foo:'a string', bar: { baz: 'another string', wrong: 'unexpected value' } };

    var score_result = scoreProperties(expectation, result);

    t.equal(score_result.max_score, 3, 'max score equals 3');
    t.equal(score_result.score, 2, 'score equals 2');

    t.end();
  });

  test.end();
});


tape( 'scoreProperties with weights', function ( test ){
  test.test('single matching weighted primitive', function ( t ){
    var expectation = 'a string';
    var result = 'a string';
    var weight = 5;

    var score_result = scoreProperties(expectation, result, weight);

    t.equal(score_result.max_score, 5, 'max score equals 5');
    t.equal(score_result.score, 5, 'score equals 5');

    t.end();
  });

  test.test('single unmatching weighted primitive', function ( t ){
    var expectation = 'a string';
    var result = 'a different string';
    var weight = 5;

    var score_result = scoreProperties(expectation, result, weight);

    t.equal(score_result.max_score, 5, 'max score equals 5');
    t.equal(score_result.score, 0, 'score equals 0');

    t.end();
  });

  test.test('object with nested object and matching properties with weight', function ( t ) {
    var expectation = { foo: 'a string', bar: { baz: 'another string' } };
    var result = { foo:'a string', bar: { baz: 'another string' } };
    var weight = { foo: 5, bar: { baz: 3}};

    var score_result = scoreProperties(expectation, result, weight);

    t.equal(score_result.max_score, 8, 'max score equals 8');
    t.equal(score_result.score, 8, 'score equals 8');

    t.end();
  });

  test.test('object with nested object and matching and mismatching properties', function ( t ) {
    var expectation = { foo: 'a string', bar: { baz: 'another string', wrong: 'expected value' } };
    var result = { foo:'a string', bar: { baz: 'another string', wrong: 'unexpected value' } };
    var weight = { foo: 5, bar: { baz: 3, wrong: 2}};

    var score_result = scoreProperties(expectation, result, weight);

    t.equal(score_result.max_score, 10, 'max score equals 10');
    t.equal(score_result.score, 8, 'score equals 8');

    t.end();
  });

  test.end();
});
