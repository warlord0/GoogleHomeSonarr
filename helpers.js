'use strict'; // eslint-disable-line strict,lines-around-directive

// const path = require('path');

const sonarrSeriesLookup = (term, Sonarr) => { // eslint-disable-line arrow-body-style
  return new Promise((resolve, reject) => {
    Sonarr.seriesLookup(term)
      .then((series) => {
        if (!(series && series.length > 0)) {
          throw new Error('No results');
        } else {
          // Now we need to select the first result and send that to the Add Series function
          let foundSeries = series[0]; // eslint-disable-line prefer-const
          resolve(foundSeries);
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

exports.sonarrSeriesAdd = (request, response) => { // eslint-disable-line no-unused-vars
  const term = encodeURIComponent(request.query.term.trim().toLowerCase());
  const Sonarr = request.sonarr;

  console.log(`Looking for ${term}`); // eslint-disable-line no-console

  sonarrSeriesLookup(term, Sonarr)
    .then((foundSeries) => { // eslint-disable-line arrow-body-style
      const newSeries = foundSeries;
      // Add the Required options for adding a new series
      newSeries.addOptions = {
        ignoreEpisodesWithFiles: true,
        ignoreEpisodesWithoutFiles: false,
        searchForMissingEpisodes: true,
      };
      newSeries.path = `${Sonarr.downloadpath}${newSeries.title}`;
      newSeries.qualityProfileId = 5; // 1 = Any, 2 = SD, 3 = 720p, 4 = 1080p, 5 = HD-Any
      Sonarr.seriesAdd(foundSeries)
        .then((addedSeries) => { // eslint-disable-line arrow-body-style
          // console.log(addedSeries); // eslint-disable-line no-console
          return addedSeries;
        })
        .catch((e) => {
          console.log(e.message); // eslint-disable-line no-console
        });
    })
    .catch((e) => {
      console.log(e.message); // eslint-disable-line no-console
    });
};
