'use strict'; // eslint-disable-line strict,lines-around-directive

// const path = require('path');

const sonarrSeriesLookup = (term, Sonarr) => { // eslint-disable-line arrow-body-style
  return new Promise((resolve, reject) => {
    Sonarr.seriesLookup(term)
      .then((series) => {
        // console.log(`${series.length} ${series[0].title}`); // eslint-disable-line no-console
        if (!(series && series.length > 0)) {
          throw new Error('No results');
        } else {
          // Now we need to select the first result and send that to the Add Series function
          let wantedSeries = series[0]; // eslint-disable-line prefer-const
          // Add the Required options for adding a new series
          wantedSeries.addOptions = {
            ignoreEpisodesWithFiles: true,
            ignoreEpisodesWithoutFiles: false,
            searchForMissingEpisodes: true,
          };
          wantedSeries.path = `${Sonarr.downloadpath}${wantedSeries.title}`;
          wantedSeries.qualityProfileId = 5; // 1 = Any, 2 = SD, 3 = 720p, 4 = 1080p, 5 = HD-Any
          // console.log(wantedSeries);
          Sonarr.seriesAdd(wantedSeries)
            .then((seriesAdded) => { // eslint-disable-line arrow-body-style
              // console.log(seriesAdded); // eslint-disable-line no-console
              resolve(seriesAdded);
            });
        }
      })
      .catch((e) => {
        reject(e);
      });
  });
};

exports.sonarrSeriesLookup = (request, response) => { // eslint-disable-line no-unused-vars
  const term = encodeURIComponent(request.query.term.trim().toLowerCase());
  const Sonarr = request.sonarr;

  console.log(`Looking for ${term}`); // eslint-disable-line no-console

  sonarrSeriesLookup(term, Sonarr)
    .then((data) => { // eslint-disable-line arrow-body-style
      // console.log(data); // eslint-disable-line no-console
      return data;
    })
    .catch((e) => {
      console.log(e.message); // eslint-disable-line no-console
    });
};
