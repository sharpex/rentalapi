const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const Credential = require("../models/Credential");
const verifyStaff = require("../middleware/verifyStaff");
const { Op } = require("sequelize");

//register a tenant
router.post("/add", verifyToken, verifyStaff, (req, res) => {
  Credential.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    surname: req.body.surname,
    houseLinker: req.body.houseLinker,
    instLinker: req.body.instLinker,
    credLinker: req.credLinker,
    trace: req.body.trace,
    linker: req.body.linker,
    email: req.body.email,
    contact: req.body.contact,
    live: 1,
    tenant: 1,
    status: req.body.status,
    deleted: 0,
  })
    .then((credential) => {
      req.io
        .to(req.body.instLinker)
        .emit("message", { ...credential, messageType: "tenant" });
      res.json({ cred: credential, status: 201 });
    })
    .catch((err) => res.json({ status: "500", message: "Error has occured" }));
});

//edit a tenant
router.post("/edit", verifyToken, verifyStaff, (req, res) => {
  Credential.findOne({
    where: { id: req.body.id, instLinker: req.body.instLinker },
  })
    .then((tenant) => {
      if (tenant) {
        tenant.firstname = req.body.firstname
          ? req.body.firstname
          : tenant.firstname;
        tenant.lastname = req.body.lastname
          ? req.body.lastname
          : tenant.lastname;
        tenant.surname = req.body.surname ? req.body.surname : tenant.surname;
        tenant.houseLinker = req.body.houseLinker
          ? req.body.houseLinker
          : tenant.houseLinker;
        tenant.email = req.body.email ? req.body.email : tenant.email;
        tenant.contact = req.body.contact ? req.body.contact : tenant.contact;
        tenant.tenant = req.body.tenant ? req.body.tenant : tenant.tenant;
        tenant.credLinker = req.credLinker;
        tenant.trace = req.body.trace ? req.body.trace : tenant.trace;
        tenant.live = 1;
        tenant.deleted = req.body.deleted ? req.body.deleted : tenant.deleted;
        tenant.save();
        req.io
          .to(req.body.instLinker)
          .emit("message", { ...tenant, messageType: "tenant" });
        res.json({ cred: tenant, status: 200 });
      } else {
        res.json({ status: 404, message: "tenant not found" });
      }
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "tenant couldn't be edited",
      })
    );
});

//get tenants
router.post("/get", verifyToken, verifyStaff, (req, res) => {
  Credential.findAll({
    where: {
      instLinker: req.body.instLinker,
      trace: { [Op.gt]: req.body.online },
      /*[Op.or]: [
        {
          admin: 1,
        },
        {
          tenant: 1,
        },
      ],*/
    },
  })
    .then((creds) => {
      res.json({ creds, status: 200 });
    })
    .catch((err) =>
      res.json({
        status: 500,
        message: "Unknown error",
      })
    );
});
module.exports = router;
