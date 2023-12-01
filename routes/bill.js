const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();
const Bill = require("../models/Bill");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyAdmin, (req, res) => {
  //create a bill
  Bill.create({
    name: req.body.name,
    details: req.body.details,
    credLinker: req.credLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((bill) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...bill, messageType: "bill" });
      res.json({ bill, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Bill couldn't be created",
      })
    );
});

//edit bill
router.post("/edit", verifyToken, verifyAdmin, (req, res) => {
  Bill.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((bill) => {
      if (bill) {
        bill.name = req.body.name ? req.body.name : bill.name;
        bill.details = req.body.details ? req.body.details : bill.details;
        bill.credLinker = req.credLinker;
        bill.trace = req.body.trace ? req.body.trace : bill.trace;
        bill.live = 1;
        bill.deleted = req.body.deleted ? req.body.deleted : bill.deleted;
        bill.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...bill, messageType: "bill" });
        res.json({ bill, status: 200 });
      } else {
        res.json({ status: 404, message: "Bill not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Bill couldn't be edited",
      })
    );
});

//get bills
router.post("/get", verifyToken, (req, res) => {
  Bill.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((bills) => {
      res.json({ bills, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
