var http = require('http');
var request = require('request');

function printProgress(done, total) {
  process.stderr.write(
    '\rTests completed: '+ done + '/' + total
  );
  if (done === total) {
    console.log(); //print a newline
  }
}

function request_urls(urls, callback) {
  var total_length = urls.length;
  var results = {};
  var agent = new http.Agent({keepAlive: true, maxSockets: 5});

  var getOneUrl = function (){
    if( urls.length === 0 ){
      clearInterval(intervalId);
      return;
    }

    var url = urls.pop();
    var intervalId;

    if (url.indexOf('Error') !== -1 ) {
      console.log("bad url");
      console.log(url);
      return;
    }

    var requestOpts = {
      url: url,
      json: true,
      agent: agent,
      gzip: true
    };

    request( requestOpts, function ( err, res ){
      var retry_codes = [408, 413, 429];
      if( err ){
        console.error( err );
        urls.push(url);
      }
      else if( retry_codes.indexOf(res.statusCode) !== -1 ){
        urls.push(url);
      }
      else if( res && res.body && res.body.geocoding && Array.isArray( res.body.geocoding.errors ) &&
               res.body.geocoding.errors[0] === 'Request Timeout after 3000ms' ){
        urls.push(url);
      }
      else {
        if( res.statusCode === 200 ){
          results[url] = res;
        }

        printProgress(Object.keys(results).length, total_length);
      }

      if( Object.keys(results).length === total_length ){
        callback( results );
      }
    });
  };

  setInterval(getOneUrl, 0);
}


module.exports = request_urls;
