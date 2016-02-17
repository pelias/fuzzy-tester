
var haversine = require( 'haversine' ); // distance measure for angle coords

/**
 * Calculate the score of an api coordinate result against
 * a single entry of expected coordinates.
 */
function scoreCoordinates(expected, actual, threshold, weight) {
  if (threshold === undefined) {
    threshold = 500; // meters
  }
  weight = weight || 1;

  var p1 = { longitude: expected[0], latitude: expected[1] };
  var p2 = { longitude: actual[0], latitude: actual[1] };
  var dist = Math.floor(haversine(p1, p2)*1000); // to meters
  var pass = dist<threshold;

  return {
    score: pass ? weight : 0,
    max_score: weight,
    diff: pass ? '' : 'Coordinates are not close enough, distance ' + dist + 'm > ' + threshold + 'm'
  };
}

module.exports = scoreCoordinates;

