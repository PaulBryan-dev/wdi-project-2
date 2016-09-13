const express = require("express");
const router  = express.Router();
const path    = require("path");

const statics = require("../controllers/statics");

router.route("/")
.get (statics.home);

module.exports = router;
