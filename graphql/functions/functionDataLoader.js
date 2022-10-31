/******** DataLoader for batching on each request ********/

const DataLoader = require("dataloader");
const { models } = require("./functionModels");
const { find_in_database } = require("../../db/db_query");
const { Schemas } = require("../../data.json");

const loaderFields = Object.entries(Schemas);
let obj = {};

const obj_loader = async (req, res, next) => {
  for (const tables of loaderFields) {
    for (const fields of tables[1]) {
      const loaderName = fields.ref + `_` + fields.field + `_Loader`;

      if (fields.field && !obj[loaderName]) {
        const batch = async (idsAndSelections) => {
          const { ids, selection } = idsAndSelections[0];
          const list = ids[0];
          const sort = {};

          const getFromDB = await find_in_database(
            models[fields.ref],
            ids,
            selection
          );
          getFromDB.forEach((element) => (sort[element.id] = element));

          if (list)
            return idsAndSelections.map((key) =>
              key.ids.map((id) => ({ ids: sort[id.toString()], selection }))
            );

          return idsAndSelections.map((key) => ({
            ids: sort[key.ids.toString()],
            selection,
          }));
        };

        obj[loaderName] = new DataLoader(batch);
      }
    }
  }
  req.dataloader = obj;
  next();
};

module.exports = { obj_loader };
