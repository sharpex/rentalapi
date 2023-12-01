const Sequelize = require("sequelize");
const db = require("../config/database");

const Invoice = db.define("invoice", {
  type: {
    type: Sequelize.STRING,
  },
  month: {
    type: Sequelize.STRING,
  },
  amount: {
    type: Sequelize.STRING,
  },
  houseLinker: {
    type: Sequelize.STRING,
  },
  tenantLinker: {
    type: Sequelize.STRING,
  },
  trace: {
    type: Sequelize.STRING,
  },
  live: {
    type: Sequelize.STRING,
  },
  linker: {
    type: Sequelize.STRING,
  },
  status: {
    type: Sequelize.STRING,
  },
  billLinker: {
    type: Sequelize.STRING,
  },
  instLinker: {
    type: Sequelize.STRING,
  },
  credLinker: {
    type: Sequelize.STRING,
  },
  deleted: {
    type: Sequelize.STRING,
  },
});

Invoice.sync().then(() => {
  console.log("invoice table created");
});
module.exports = Invoice;
