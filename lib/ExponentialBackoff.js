'use strict';

var ExponentialBackoff = function(minimum_backoff, exponent, starting_backoff) {
    if (minimum_backoff === undefined) {
        minimum_backoff = 50;
    }

    if (exponent === undefined) {
        exponent = 2.0;
    }

    if (starting_backoff === undefined) {
        starting_backoff = minimum_backoff;
    }

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
