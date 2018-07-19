var http = require('http');
var https = require('https');
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
             res.body.geocoding.errors[0].indexOf('Request Timeout') !== -1 ){
    return true;
  }
  return false;
}

function request_urls(config, urls, callback) {
  var total_length = urls.length;
  var responses = {};
  var httpAgent = new http.Agent({keepAlive: true, maxSockets: 1});
  var httpsAgent = new https.Agent({keepAlive: true, maxSockets: 1});
  var intervalId;
  const interval = 1000 / config.rate; // the number of miliseconds to delay between requests
  var test_interval = new ExponentialBackoff(interval, 5, interval, 20000);
  var delay = test_interval.getBackoff();

  var getOneUrl = function (){
    if( urls.length === 0 ){
      return;
    }

    var url = urls.pop();

    const agent = (url.startsWith('https:')) ? httpsAgent : httpAgent;

    var requestOpts = {
      headers: {'user-agent': 'pelias-fuzzy-tester'},
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
        printProgress(Object.keys(responses).length, total_length);
        test_interval.increaseBackoff();
      }
      else {
        responses[url] = res;
        test_interval.decreaseBackoff();

        printProgress(Object.keys(responses).length, total_length);
      }

      if( Object.keys(responses).length === total_length ){
        clearInterval(intervalId);
        callback( responses );
      } else {
        if (delay !== test_interval.getBackoff()) {
          delay = test_interval.getBackoff();
          clearInterval(intervalId);
          intervalId = setInterval(getOneUrl, delay);
        }
      }
    });
  };

  intervalId = setInterval(getOneUrl, test_interval.getBackoff());
}


module.exports = request_urls;
