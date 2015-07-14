'use strict';

var ExponentialBackoff = function(minimum_backoff, exponent, starting_backoff) {
    this.minimum_backoff = minimum_backoff || 50;
    this.exponent = exponent || 2.0;
    this.starting_backoff = starting_backoff || minimum_backoff;

    this.backoff = starting_backoff;
};

ExponentialBackoff.prototype.getBackoff = function getBackoff() {
    return this.backoff;
};

ExponentialBackoff.prototype.increaseBackoff = function increaseBackoff() {
    this.backoff *= this.exponent;
};

ExponentialBackoff.prototype.decreaseBackoff = function decreaseBackoff() {
    if (this.backoff <= this.minimum_backoff) {
        this.backoff = this.minimum_backoff;
    } else {
        this.backoff /= this.exponent;
    }
};

module.exports = ExponentialBackoff;
