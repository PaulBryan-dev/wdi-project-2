const rp         = require("request-promise");
const cheerio    = require("cheerio");
const Bluebird   = require("bluebird");
const mongoose   = require("mongoose");
mongoose.Promise = Bluebird;
const config     = require("../config/config");
const Station    = require("../models/station");
const url        = "https://en.wikipedia.org/wiki/List_of_former_and_unopened_London_Underground_stations";
const locations  = [];
let count        = 0;

mongoose.connect(config.db);

Station.collection.drop();

function getStations(){
  return rp(url)
  .then((body, response) => {
    const $             = cheerio.load(body);
    const stationScrape = $("tr td a");

    stationScrape.each((i, station) => {
      let location = {
        name: $(station).text(),
        url:  $(station).attr("href")
      };

      if (location.url && location.name && relativeUrl(location.url) && doesntStartWithHash(location.url) && validateUrl(`${url}${location.url}`)) {
        let newUrl = `${url}${location.url}`;
        // console.log(newUrl);
        return locations.push(newUrl);
      }
    });

    return Bluebird.mapSeries(locations, location => {
      return rp(location);
    });
  })
  .then(data => {
    return Bluebird.map(data, (body, i) => {
      const $ = cheerio.load(body);
      const images = $("img");


      let stationData = {};
      if (images) {
        stationData.url   = locations[i];
        stationData.image = images[0].attribs("style");
        return Station.create(stationData);
      } else {
        return;
      }
    });
  })
  .then(data => {
    // console.log("DONE");
    // console.log(data);
  })
  .catch(console.error);
}

getStations();

function validateUrl(value){
  return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
}

function relativeUrl(value){
  return !/^http:\/\//.test(value);
}

function doesntStartWithHash(value) {
  return value.indexOf("#") === -1;
}
