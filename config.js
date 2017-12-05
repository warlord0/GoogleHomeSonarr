
'use strict'; // eslint-disable-line

let sonarrConfig = [];
let globalConfig = {};

try {
  // Try to import the sonarr hosts. If not found, we'll asume that env varialbes are available.
  let config = require('./sonarr.config.js'); // eslint-disable-line global-require,prefer-const

  sonarrConfig = config.sonarrConfig; // eslint-disable-line prefer-destructuring
  globalConfig = config.globalConfig; // eslint-disable-line prefer-destructuring
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  }
}

const Sonarr = require('./api/node.js');

const Init = function () { // eslint-disable-line func-names
  this.sonarrHosts = [];
  this.globalConf = {};

  require('dotenv').load(); // eslint-disable-line global-require
  if (sonarrConfig.length !== 0) {
    // We've found one or more sonarr configurations.
    this.sonarrHosts = sonarrConfig.map(config => ({
      id: config.id,
      host: new Sonarr(
        config.sonarrIp, config.sonarrPort, config.sonarrApiKey,
        config.sonarrDownloadPath,
      ),
    }));
    console.log(`Loaded ${this.sonarrHosts.length} hosts from the config.js`); // eslint-disable-line no-console
  } else {
    if (!process.env.AUTH_TOKEN || !process.env.sonarr_IP ||
      !process.env.sonarr_PORT || !process.env.sonarr_APIKEY || !process.env.sonarr_DOWNLOADPATH) {
      console.log('Missing sonarr host config. Please configure one using the .env (when using Glitch) or the config.js file.'); // eslint-disable-line no-console
      process.exit();
    }

    this.sonarrHosts[0] = {
      id: 'sonarr',
      host: new Sonarr(
        process.env.sonarr_IP, process.env.sonarr_PORT, process.env.sonarr_APIKEY,
        process.env.sonarr_DOWNLOADPATH,
      ),
    };
  }

  if (Object.keys(globalConfig).length > 0) {
    console.log(`Starting using sonarr.config.js, ${JSON.stringify(globalConfig)}`); // eslint-disable-line no-console
    this.globalConf = globalConfig;
  } else {
    if (!process.env.AUTH_TOKEN || !process.env.PORT) {
      console.log('Missing AuthToken. Please configure one using the .env (when using Glitch) or the config.js file.'); // eslint-disable-line no-console
      process.exit();
    }
    this.globalConf.authToken = process.env.AUTH_TOKEN;
    this.globalConf.listenerPort = process.env.PORT;
    console.log('Loaded config from .env'); // eslint-disable-line no-console
  }

  this.getHost = (sonarrId) => {
    let returnHost;

    if (sonarrId) {
      returnHost = this.sonarrHosts.filter((sonarrHost) => {
        if (sonarrHost.id === sonarrId) {
          return sonarrHost.host;
        }
        return null;
      })[0].host;
    } else {
      returnHost = this.sonarrHosts[0].host;
    }
    return returnHost;
  };

  /*
  * Check the request to determine to which sonarr instance we want to route the actions to.
  * The request object is anylyzed. And the sonarr object is attached to the request,
  * for further use.
  */
  this.routeSonarrInstance = (request) => {
    // For now we are only attaching the first host in the list.
    // Next will be to determin a way of passing a host, through IFTTT.
    request.sonarr = this.getHost(request.body.sonarrId);
    request.config = this.globalConf;
  };
};

module.exports = Init;
