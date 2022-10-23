/******** FILE FORMAT 
1. 
********/

const DataLoader = require("dataloader");
const { models } = require("../models/functionModels");
const { Schemas } = require("../../data.json");

const { find_in_database } = require("../../db/db_query");

const loaderFields = Object.entries(Schemas);
let obj = {};

const obj_loader = async (req, res, next) => {
  //const a = req.body.query;
  for (const tables of loaderFields) {
    for (const fields of tables[1]) {
      const loaderName = fields.ref + `_` + fields.field + `_Loader`;
      if (fields.field && !obj[loaderName]) {
        obj[loaderName] = new DataLoader(async (keys) => {
          const getfromDB = await find_in_database(models[fields.ref], keys);
          const sort = {};
          getfromDB.forEach((element) => {
            sort[element.id] = element;
          });
          return keys.map((key) => sort[key]);
        });
      }
    }
  }
  req.dataloader = obj;
  next();
};

module.exports = { obj_loader };
