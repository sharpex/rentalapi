const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const Owner = require("../models/Owner");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create a owner
  Owner.create({
    name: req.body.name,
    contact: req.body.contact,
    email: req.body.email,
    details: req.body.details,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((owner) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...owner, messageType: "owner" });
      res.json({ owner, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Owner couldn't be created",
      })
    );
});

//edit owner
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Owner.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((owner) => {
      if (owner) {
        owner.name = req.body.name ? req.body.name : owner.name;
        owner.email = req.body.email ? req.body.email : owner.email;
        owner.contact = req.body.contact ? req.body.contact : owner.contact;
        owner.details = req.body.details ? req.body.details : owner.details;
        owner.credLinker = req.credLinker;
        owner.trace = req.body.trace ? req.body.trace : owner.trace;
        owner.live = 1;
        owner.deleted = req.body.deleted ? req.body.deleted : owner.deleted;
        owner.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...owner, messageType: "owner" });
        res.json({ owner, status: 200 });
      } else {
        res.json({ status: 404, message: "Owner not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Owner couldn't be edited",
      })
    );
});

//get owners
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  Owner.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((owners) => {
      res.json({ owners, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
