const Station = require("../models/station");

function stationsIndex(req, res){
  Station.find((err, stations) => {
    if (err) return res.status(500).send();
    return res.status(200).json({ stations: stations });
  });
}

module.exports = {
  index: stationsIndex
};
