const mongoose = require("mongoose");

const stationSchema = mongoose.Schema({
  available: String,
  file: String,
  lat: String,
  lng: String,
  postcode: String,
  location: String
});

module.exports = mongoose.model("Station", stationSchema);
