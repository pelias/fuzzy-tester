var http = require('http');
var https = require('https');
var zlib = require('zlib');
var apiKey = require( '../lib/apiKey' );

var ExponentialBackoff = require( '../lib/ExponentialBackoff');

var retries = 0;

var PROGRESS_INTERVAL_MS = 33;
var TICK_MS = 5;
var lastProgressPrint = 0;

function printProgress(done, total) {
  var now = Date.now();
  if (done !== total && now - lastProgressPrint < PROGRESS_INTERVAL_MS) {
    return;
  }
  lastProgressPrint = now;

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
             typeof res.body.geocoding.errors[0] === 'string' &&
             res.body.geocoding.errors[0].indexOf('Request Timeout') !== -1 ){
    return true;
  }
  return false;
}

function makeRequest(requestOpts, callback) {
  var parsedUrl = new URL(requestOpts.url);
  var transport = parsedUrl.protocol === 'https:' ? https : http;

  var options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'GET',
    headers: Object.assign({ 'accept-encoding': 'gzip, deflate' }, requestOpts.headers),
    agent: requestOpts.agent
  };

  var req = transport.request(options, function(incomingMsg) {
    var stream = incomingMsg;
    var encoding = incomingMsg.headers['content-encoding'];

    if (encoding === 'gzip') {
      stream = incomingMsg.pipe(zlib.createGunzip());
    } else if (encoding === 'deflate') {
      stream = incomingMsg.pipe(zlib.createInflate());
    }

    var chunks = [];
    stream.on('data', function(chunk) { chunks.push(chunk); });
    stream.on('error', function(err) { callback(err); });
    stream.on('end', function() {
      var body = Buffer.concat(chunks).toString();
      try {
        body = JSON.parse(body);
      } catch (e) {
        // leave as string if not valid JSON
      }
      callback(null, { statusCode: incomingMsg.statusCode, body: body });
    });
  });

  req.on('error', function(err) { callback(err); });
  req.end();
}

function request_urls(config, urls, callback) {
  const maxSockets = config.maxSockets || 1;
  var total_length = urls.length;
  var responses = {};
  var done_count = 0;
  var latencies = [];
  var inFlight = 0;
  var httpAgent = new http.Agent({keepAlive: true, maxSockets: maxSockets});
  var httpsAgent = new https.Agent({keepAlive: true, maxSockets: maxSockets});
  var intervalId;
  const interval = 1000 / config.rate; // the number of miliseconds to delay between requests
  var test_interval = new ExponentialBackoff(interval, 5, interval, 20000);
  var credit = 0; // fractional number of requests currently owed by the rate limit
  var lastTick = Date.now();

  var apiUrl = config.endpoint.url;
  var key = apiKey( apiUrl );

  // called every TICK_MS: sends however many requests the current rate says
  // are due since the last tick
  var tick = function (){
    // check if all responses have been recieved and call the next step in
    // processing via the `callback` function
    if( done_count === total_length ){
      clearInterval(intervalId);
      return callback( responses, latencies );
    }

    var now = Date.now();
    credit += (now - lastTick) / test_interval.getBackoff();
    lastTick = now;

    // keep requests out of the agent's queue so backoff acts on what is
    // actually being sent
    var due = Math.floor(credit);
    var sendCount = Math.min(due, maxSockets - inFlight, urls.length);
    for (var i = 0; i < sendCount; i++) {
      sendUrl(urls.pop());
    }
    credit -= sendCount;

    // requests we couldn't send (all sockets busy, or nothing left to send)
    // are dropped rather than saved up as a burst
    if (sendCount < due) {
      credit %= 1;
    }
  };

  var sendUrl = function (url){
    const agent = (url.startsWith('https:')) ? httpsAgent : httpAgent;

    var requestOpts = {
      headers: {'user-agent': 'pelias-fuzzy-tester'},
      url: url,
      agent: agent
    };

    if (key && key.method === 'Header') {
      requestOpts.headers.authorization = `${key.value}`;
    }

    if (key && key.method === 'GET') {
      requestOpts.url = url + `&${key.keyName}=${key.value}`;
    }

    var sentAt = Date.now();
    inFlight++;
    makeRequest( requestOpts, function ( err, res ){
      inFlight--;
      if( err ){
        console.error( err );
        //Check if hostname is valid. Abort execution if not
        if( err.code === 'ENOTFOUND' ) {
          throw new Error( 'Invalid hostname: "'+ err.hostname + '". Stopping execution.' );
        }
        urls.push(url);
      }
      else if( shouldRetryRequest(res) ){
        urls.push(url);
        retries++;
        printProgress(done_count, total_length);
        test_interval.increaseBackoff();
      }
      else {
        responses[url] = res;
        latencies.push(Date.now() - sentAt);
        done_count++;
        test_interval.decreaseBackoff();

        printProgress(done_count, total_length);
      }

      if( done_count === total_length ){
        clearInterval(intervalId);
        callback( responses, latencies );
      }
    });
  };

  intervalId = setInterval(tick, TICK_MS);
}


module.exports = request_urls;
