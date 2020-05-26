const url = require('url');
const logger = require('pelias-logger').get('fuzzy-tester');

const deprecation_message = 'Loading credentials from deprecated `mapzen.api_key` pelias.json property.' +
  'Credentials should now live in `acceptance-tests.credentials`';

module.exports = function( uri ){
  const config = require('pelias-config').generate();
  const host = url.parse( uri ).host;

  const preferred_credentials = config.get('acceptance-tests.credentials');

  const old_credentials = config.get('mapzen.api_key');

  if (preferred_credentials && preferred_credentials[host] !== undefined) {
    return preferred_credentials[host] || null;
  }

  if (old_credentials && old_credentials[host]) {
    logger.warn(deprecation_message);
    return old_credentials[ host ];
  }

  return null;
};
