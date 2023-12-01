const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const Building = require("../models/Building");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a building
  Building.create({
    name: req.body.name,
    details: req.body.details,
    credLinker: req.credLinker,
    ownerLinker: req.body.ownerLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((building) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...building, messageType: "building" });
      res.json({ building, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Building couldn't be created",
      })
    );
});

//edit building
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  Building.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((building) => {
      if (building) {
        building.name = req.body.name ? req.body.name : building.name;
        building.details = req.body.details
          ? req.body.details
          : building.details;
        building.ownerLinker = req.body.ownerLinker
          ? req.body.ownerLinker
          : building.ownerLinker;
        building.credLinker = req.credLinker;
        building.trace = req.body.trace ? req.body.trace : building.trace;
        building.live = 1;
        building.deleted = req.body.deleted
          ? req.body.deleted
          : building.deleted;
        building.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...building, messageType: "building" });
        res.json({ building, status: 200 });
      } else {
        res.json({ status: 404, message: "Building not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Building couldn't be edited",
      })
    );
});

//get buildings
router.post("/get", verifyToken, (req, res) => {
  Building.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((buildings) => {
      res.json({ buildings, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
