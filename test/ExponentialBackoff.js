'use strict';

var tape = require( 'tape' );
var ExponentialBackoff = require( '../lib/ExponentialBackoff' );

tape( 'ExponentialBackoff', function(test) {
    test.test( 'calling increaseBackoff() makes backoff larger', function(t) {
        var eb = new ExponentialBackoff();
        var startBackoff = eb.getBackoff();
        eb.increaseBackoff();
        t.ok(startBackoff < eb.getBackoff(), 'backoff was higher');
        t.end();
    });

    test.test( 'calling decreaseBackoff() lowers backoff', function(t) {
        var eb = new ExponentialBackoff();
        eb.increaseBackoff();
        var startBackoff = eb.getBackoff();
        eb.decreaseBackoff();
        t.ok(startBackoff > eb.getBackoff(), 'backoff was lower');
        t.end();
    });

    test.test( 'calling decreaseBackoff() will not lower backoff below minimum', function(t) {
        var eb = new ExponentialBackoff();
        var startBackoff = eb.getBackoff();
        eb.decreaseBackoff();
        t.ok(startBackoff === eb.getBackoff(), 'backoff was at minimum');
        t.end();
    });

    test.test( 'calling increaseBackoff() will not raise backoff above maximum', function(t) {
      var maxBackoff = 300;
      var eb = new ExponentialBackoff(100, 5, 100, maxBackoff);
      eb.increaseBackoff();

      t.equal(eb.getBackoff(), maxBackoff, 'backoff capped at maximum');
      t.end();
    });

    test.end();
});
