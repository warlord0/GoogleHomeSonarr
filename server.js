'use strict'; // eslint-disable-line strict,lines-around-directive
/*
 * This was designed to provide a Node.js proxy for using Goggle Home (assistant) to
 * send command to Sonarr.
 * Based on the excellent work from here: https://github.com/OmerTu/GoogleHomeKodi
*/

const express = require('express');
const bodyParser = require('body-parser');
const Helper = require('./helpers.js');
const ResponseException = require('./exceptions.js').ResponseException; // eslint-disable-line prefer-destructuring
const LoadConfig = require('./config.js');

const config = new LoadConfig();
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const handleResponse = (response, error) => {
  console.log(`Error trying to validate the request. Error: ${error.message}`); // eslint-disable-line no-console
  if (error.status) {
    response.status(error.status).send(error.message);
  } else {
    response.status(400).send(error);
  }
};

const validateRequest = function (request) { // eslint-disable-line func-names
  return new Promise((resolve, reject) => {
    let authToken = '';

    if (request === null || request.query === request) {
      console.log('403 - Unauthorized request'); // eslint-disable-line no-console
      reject(new ResponseException('403 - Unauthorized request', 403));
      return;
    }

    if (request.body) {
      authToken = request.body.token;
      if (!authToken) {
        reject(new ResponseException('401 - You need to use an authorisation token.', 401));
        return;
      }

      console.log(`Auth Token = ${authToken}`); // eslint-disable-line no-console
      if (authToken === config.globalConf.authToken) {
        console.log('Authentication succeeded'); // eslint-disable-line no-console
        config.routeSonarrInstance(request);
        resolve('Authentication succeeded');
        return;
      }
    } else {
      console.log('401 - Missing request query'); // eslint-disable-line no-console
      reject(new ResponseException('401 - Missing request query', 401));
      return;
    }

    console.log('401 - Authentication failed'); // eslint-disable-line no-console
    reject(new ResponseException('401 - Authentication failed', 401));
  });
};

app.get('/', (request, response) =>
  response.send('Noting to see here'));

app.post('/series', (request, response) => {
  validateRequest(request, response).then(() => {
    Helper.sonarrSeriesLookup(request, response);
    response.sendStatus(200);
  })
    .catch(error => handleResponse(response, error)); // eslint-disable-line arrow-parens
});

const listener = app.listen(config.globalConf.listenerPort, () =>
  console.log(`App listening on port ${listener.address().port}`)); // eslint-disable-line no-console
