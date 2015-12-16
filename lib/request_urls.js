var http = require('http');
var request = require('request');

var ExponentialBackoff = require( '../lib/ExponentialBackoff');

var retries = 0;

function printProgress(done, total) {
  process.stderr.write(
    '\rTests completed: '+ done + '/' + total + ' (retries: ' + retries + ')'
  );
  if (done === total) {
    console.log(); //print a newline
  }
}

function shouldRetryRequest(res) {
  var retry_codes = [408, 413, 429];
  if( retry_codes.indexOf(res.statusCode) !== -1 ){
    return true;
  } else if( res.body && res.body.geocoding && Array.isArray( res.body.geocoding.errors ) &&
             res.body.geocoding.errors[0].message.indexOf('Request Timeout') !== -1 ){
    return true;
  }
  return false;
}

function request_urls(urls, callback) {
  var total_length = urls.length;
  var results = {};
  var agent = new http.Agent({keepAlive: true, maxSockets: 1});
  var intervalId;
  var test_interval = new ExponentialBackoff(25, 3, 25);

  var getOneUrl = function (){
    if( urls.length === 0 ){
      return;
    }

    var url = urls.pop();

    var requestOpts = {
      url: url,
      json: true,
      agent: agent,
      gzip: true
    };

    request( requestOpts, function ( err, res ){
      if( err ){
        console.error( err );
        urls.push(url);
      }
      else if( shouldRetryRequest(res) ){
        urls.push(url);
        retries++;
        printProgress(Object.keys(results).length, total_length);
        test_interval.increaseBackoff();
      }
      else {
        results[url] = res;
        test_interval.decreaseBackoff();

        printProgress(Object.keys(results).length, total_length);
      }

      if( Object.keys(results).length === total_length ){
        clearInterval(intervalId);
        callback( results );
      } else {
        clearInterval(intervalId);
        intervalId = setInterval(getOneUrl, test_interval.getBackoff());
      }
    });
  };

  intervalId = setInterval(getOneUrl, test_interval.getBackoff());
}


module.exports = request_urls;
