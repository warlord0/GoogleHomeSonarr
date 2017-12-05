/**
 * Custom response exception
 * @param {*} message Exception message.
 * @param {*} statusText Optional status text, retreived from the responses status text.
 * @param {*} status Optional status response code.
 */
function ResponseException(message, statusText, status) {
  this.message = message;
  this.name = 'ResponseException';
  this.statusText = statusText || this.message;
  this.status = status || 400;
}

module.exports = function (fetch) { // eslint-disable-line func-names
  function Sonarr(ip, port, apikey, downloadpath) {
    this.url = `http://${ip}:${port}/api`;
    this.apikey = apikey;
    this.downloadpath = downloadpath;

    this.seriesLookup = function (term, callback) { // eslint-disable-line no-unused-vars,func-names
      const params = `?term=${term}`;
      return this.getHTTP('series/lookup', params, callback);
    };

    this.seriesAdd = function (wantedSeries, callback) { // eslint-disable-line no-unused-vars,func-names,max-len
      return this.postHTTP('series', wantedSeries, callback);
    };
  }

  Sonarr.prototype.getHTTP = function (service, params, callback) { // eslint-disable-line func-names,max-len
    return fetch(`${this.url}/${service}${params}&apikey=${this.apikey}`, {
      method: 'GET',
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new ResponseException(
            `Error in response, ${response.statusText} with status code: ${response.status}`,
            response.statusText, response.status,
          );
        }
        return response.json();
      })
      .then((data) => {
        if (callback) callback(data);
        return data;
      })
      .catch((e) => {
        console.log(e.message); // eslint-disable-line no-console
      });
  };

  Sonarr.prototype.postHTTP = function (service, params, callback) { // eslint-disable-line func-names,max-len
    return fetch(`${this.url}/${service}?apikey=${this.apikey}`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
      .then((response) => {
        // Return status of 400 means the series already exists
        switch (response.status) {
          case 200:
          case 201:
          case 400:
            break;
          default:
            throw new ResponseException(
              `Error in response, ${response.statusText} with status code: ${response.status}`,
              response.statusText, response.status,
            );
        }
        return response.json();
      })
      .then((data) => {
        if (callback) callback(data);
        return data;
      })
      .catch((e) => {
        console.log(e.message); // eslint-disable-line no-console
      });
  };

  return Sonarr;
};
