module.exports = {
  index:  stationsIndex,
  show:   stationsShow,
  create: stationsCreate,
  update: stationsUpdate,
  delete: stationsDelete
};

const Station = require("../models/station");

function stationsIndex(req, res){
  Station.find({}, (err, stations) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json({ stations });
  });
}

function stationsShow(req, res){
  Station.findById(req.params.id, (err, station) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    if (!station) return res.status(404).json({ message: "No station was found." });
    return res.status(200).json({ station });
  });
}

function stationsCreate(req, res){
  Station.create(req.body.station, (err, station) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(201).json({ station });
  });
}

function stationsUpdate(req, res){
  Station.findByIdAndUpdate(req.params.id, req.body.station, { new: true }, (err, station) => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(200).json({ station });
  });
}

function stationsDelete(req, res){
  Station.findByIdAndRemove(req.params.id, err => {
    if (err) return res.status(500).json({ message: "Something went wrong." });
    return res.status(204).json({ message: "Deleted." });
  });
}
