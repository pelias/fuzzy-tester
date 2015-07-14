'use strict';

/**
 * ExponentialBackoff class handles the logic for increasing or decreasing the delay between
 * multiple requests. See https://en.wikipedia.org/wiki/Exponential_backoff
 *
 * @param {number} minimum_backoff the lowest permissible delay between requests. defaults to 50ms
 * @param {number} exponent the factor by which to increse or decrease the backoff. defaults to 2
 * @param {number} starting_backoff the backoff between the first and second request. defaults to * 50ms
 */
var ExponentialBackoff = function(minimum_backoff, exponent, starting_backoff) {
    this.minimum_backoff = minimum_backoff || 50;
    this.exponent = exponent || 2.0;
    this.starting_backoff = starting_backoff || minimum_backoff;

    this.backoff = starting_backoff;
};

/**
 * Get the current backoff as a simple number
 */
ExponentialBackoff.prototype.getBackoff = function getBackoff() {
    return this.backoff;
};


/**
 * Increase the backoff for the next request. This method should be called after something happens
 * that would indicate a slowdown is needed, such as a failed request.
 */
ExponentialBackoff.prototype.increaseBackoff = function increaseBackoff() {
    this.backoff *= this.exponent;
};

/**
 * Decrease the backoff for the next request. The backoff will never go below the miniumum backoff
 * value. This should be called when things are going smoothly, such as after a successful request.
 */
ExponentialBackoff.prototype.decreaseBackoff = function decreaseBackoff() {
    if (this.backoff <= this.minimum_backoff) {
        this.backoff = this.minimum_backoff;
    } else {
        this.backoff /= this.exponent;
    }
};

module.exports = ExponentialBackoff;
