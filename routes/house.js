const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const House = require("../models/House");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a house
  House.create({
    name: req.body.name,
    details: req.body.details,
    rent: req.body.rent,
    deposit: req.body.deposit,
    credLinker: req.credLinker,
    buildingLinker: req.body.buildingLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((house) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...house, messageType: "house" });
      res.json({ house, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "House couldn't be created",
      })
    );
});

//edit house
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  House.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((house) => {
      if (house) {
        house.name = req.body.name ? req.body.name : house.name;
        house.details = req.body.details ? req.body.details : house.details;
        house.rent = req.body.rent ? req.body.rent : house.rent;
        house.deposit = req.body.deposit ? req.body.deposit : house.deposit;
        house.buildingLinker = req.body.buildingLinker
          ? req.body.buildingLinker
          : house.buildingLinker;
        house.credLinker = req.credLinker;
        house.trace = req.body.trace ? req.body.trace : house.trace;
        house.live = 1;
        house.deleted = req.body.deleted ? req.body.deleted : house.deleted;
        house.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...house, messageType: "house" });
        res.json({ house, status: 200 });
      } else {
        res.json({ status: 404, message: "House not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "House couldn't be edited",
      })
    );
});

//get houses
router.post("/get", verifyToken, (req, res) => {
  House.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((houses) => {
      res.json({ houses, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
