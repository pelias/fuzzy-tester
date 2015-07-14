'use strict';

var ExponentialBackoff = function(minimum_backoff, exponent, starting_backoff) {
    minimum_backoff = minimum_backoff || 50;
    exponent = exponent || 2.0;
    starting_backoff = starting_backoff || minimum_backoff;

    var backoff = starting_backoff;

    return {
        getBackoff: function() {
            return backoff;
        },
        increaseBackoff: function() {
            backoff *= exponent;
        },
        decreaseBackoff: function() {
            if (backoff <= minimum_backoff) {
                backoff = minimum_backoff;
            } else {
                backoff /= exponent;
            }
        }
    };
};

module.exports = ExponentialBackoff;
