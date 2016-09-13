const express = require("express");
const router  = express.Router();

const staticsController         = require("../controllers/statics");
const stationsController        = require("../controllers/stations");
const authenticationsController = require("../controllers/authentications");

router.route("/")
  .get(staticsController.home);

router.route("/stations")
  .get(stationsController.index);

router.route("/register")
  .post(authenticationsController.register);

router.route("/login")
  .post(authenticationsController.login);

module.exports = router;
