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
  var coords = actual.geometry.coordinates;
  var p1 = { longitude: expected[0], latitude: expected[1] };
  var p2 = { longitude: coords[0], latitude: coords[1] };
  var dist = Math.floor(haversine(p1, p2)*1000); // to metres
  var pass = dist<threshold;

  return {
    score: pass ? weight : 0,
    max_score: weight,
    diff: pass ? '' : actual.properties.name +
      ',' + actual.properties.locality +
      ' is not close enough, distance=' + dist + ' m'
  };
}

module.exports = scoreCoordinates;

