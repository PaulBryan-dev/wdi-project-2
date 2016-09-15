const rp         = require("request-promise");
const cheerio    = require("cheerio");
const mongoose   = require("mongoose");
const config     = require("../config/config");
const Station    = require("../models/station");
const url        = "https://en.wikipedia.org/wiki/List_of_former_and_unopened_London_Underground_stations";
const locations  = [];
let count        = 0;

mongoose.connect(config.db);

Station.collection.drop();

rp(url)
.then((html, response) => {
  const $             = cheerio.load(html);
  const stationScrape = $(".wikitable:first-of-type tr td:first-child a");
  const locations     = [];
  stationScrape.each((i, station) =>{
    let location = {
      name: $(station).text(),
      url:  $(station).attr("href")
    };
    locations.push(location);
  });
  console.log(`I've found ${locations.length} locations`);

  locations.forEach((location, i) => {

    rp(`https://en.wikipedia.org${location.url}`)
    .then((body, response) => {
      const $      = cheerio.load(body);
      let name     = $("#firstHeading");
      if (!name) return;
      name = name.text();

      let image  = $("a.image img:first-of-type");
      if (image) {
        image = `https:${image.attr("src")}`;
      }

      const coords        = $("#coordinates span.geo-dec");
      if (coords.length === 0) return;

      const coordsString  = coords.text();
      let coordsArray     = coordsString.split(" ");
      if (coordsArray.length < 2) return;

      coordsArray        = coordsArray.map(coord => {
        if (coord.indexOf("W") !== -1) {
          return -(parseFloat(coord));
        } else {
          return parseFloat(coord);
        }
      });

      let obj = {
        name:  name,
        image: image,
        lat:   coordsArray[0],
        lng:   coordsArray[1],
      };

      console.log("SAVE OBJECT", obj);

      Station.create(obj, (err, station) => {
        if (err) return console.error(err);
        return console.log(`${station.name} was saved`);
      });
    });
  });
})
.catch(console.error);

function doesntStartWithHash(value) {
  return value.indexOf("#") === -1;
}
