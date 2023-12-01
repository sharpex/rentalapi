const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const Invoice = require("../models/Invoice");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

router.post("/add", verifyToken, verifyStaff, (req, res) => {
  //create an invoice
  Invoice.create({
    type: req.body.type,
    month: req.body.month,
    amount: req.body.amount,
    tenantLinker: req.body.tenantLinker,
    houseLinker: req.body.houseLinker,
    credLinker: req.credLinker,
    billLinker: req.body.billLinker,
    instLinker: req.body.instLinker,
    live: 1,
    linker: req.body.linker,
    trace: req.body.trace,
    deleted: req.body.deleted || 0,
    status: 0,
  })
    .then((invoice) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...invoice, messageType: "invoice" });
      res.json({ invoice, status: 201 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Invoice couldn't be created",
      })
    );
});

//edit invoice
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Invoice.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((invoice) => {
      if (invoice) {
        invoice.type = req.body.type ? req.body.type : invoice.type;
        invoice.month = req.body.month ? req.body.month : invoice.month;
        invoice.amount = req.body.amount ? req.body.amount : invoice.amount;
        invoice.tenantLinker = req.body.tenantLinker
          ? req.body.tenantLinker
          : invoice.tenantLinker;
        invoice.houseLinker = req.body.houseLinker
          ? req.body.houseLinker
          : invoice.houseLinker;
        invoice.billLinker = req.body.billLinker
          ? req.body.billLinker
          : invoice.billLinker;
        invoice.credLinker = req.credLinker;
        invoice.trace = req.body.trace ? req.body.trace : invoice.trace;
        invoice.live = 1;
        invoice.deleted = req.body.deleted ? req.body.deleted : invoice.deleted;
        invoice.save();
        req.io.to(req.body.instLinker).emit("message", {
          ...invoice,
          messageType: "invoice",
        });
        res.json({ invoice, status: 200 });
      } else {
        res.json({ status: 404, message: "Invoice not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Invoice couldn't be edited",
      })
    );
});

//get invoices
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  Invoice.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
    },
  })
    .then((invoices) => {
      res.json({ invoices, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});

module.exports = router;
