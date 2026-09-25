'use strict';

var tape = require( 'tape' );

var latencySummary = require( '../lib/latencySummary' );

tape( 'latencySummary', function ( test ){
  test.test('no latencies', function ( t ){
    t.equal(latencySummary([]), null, 'no summary');
    t.end();
  });

  test.test('single latency', function ( t ){
    t.deepEqual(latencySummary([7]), {mean: 7, p50: 7, p90: 7, p99: 7, max: 7});
    t.end();
  });

  test.test('unsorted latencies do not modify input', function ( t ){
    var latencies = [];
    for (var i = 100; i >= 1; i--) {
      latencies.push(i);
    }

    t.deepEqual(latencySummary(latencies), {mean: 51, p50: 50, p90: 90, p99: 99, max: 100});
    t.equal(latencies[0], 100, 'input order unchanged');
    t.end();
  });

  test.test('format', function ( t ){
    var summary = {mean: 51, p50: 50, p90: 90, p99: 99, max: 100};
    t.equal(latencySummary.format(summary),
      'Latency: mean 51ms, p50 50ms, p90 90ms, p99 99ms, max 100ms');
    t.end();
  });
});
