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
  for (const tables of loaderFields) {
    for (const fields of tables[1]) {
      const loaderName = fields.ref + `_` + fields.field + `_Loader`;
      if (fields.field && !obj[loaderName]) {
        // let a = req.body.query;
        // let b = fields.field in a;
        // console.log(b);
        obj[loaderName] = new DataLoader(async (keys) => {
          //console.log(keys);
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
  //console.log(obj);
  req.dataloader = obj;
  next();
};

module.exports = { obj_loader };
