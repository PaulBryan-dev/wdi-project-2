const express = require("express");
const router  = express.Router();

const staticsController = require("../controllers/statics");
const stationsController = require("../controllers/stations");

router.route("/")
  .get(staticsController.home);

router.route("/stations")
  .get(stationsController.index);

module.exports = router;
