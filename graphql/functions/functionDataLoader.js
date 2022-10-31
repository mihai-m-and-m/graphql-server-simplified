/******** DataLoader for batching on each request ********/

const DataLoader = require("dataloader");
const { find_in_database } = require("../../db/db_query");
const { models } = require("./functionModels");
const { Schemas } = require("../../data.json");

const loaderFields = Object.entries(Schemas);

/******************************************************************************
 Batch all Ids and selected fields from Query and sort them after DB response
******************************************************************************/
const batchIdsAndSelections = async (idsAndSelections, field) => {
  const { ids, selection } = idsAndSelections[0];
  const list = ids[0];
  const sort = {};
  try {
    const getFromDB = await find_in_database(models[field.ref], ids, selection);
    getFromDB.forEach((element) => (sort[element.id] = element));

    if (list)
      return idsAndSelections.map((key) =>
        key.ids.map((id) => ({ ids: sort[id.toString()], selection }))
      );

    return idsAndSelections.map((key) => ({
      ids: sort[key.ids.toString()],
      selection,
    }));
  } catch (err) {
    errors_logs(err);
    error_set("DataLoader", field + ids + err.message);
  }
};

/******************************************************************
 Make for each request one Loader to proper handle database query's
*******************************************************************/
const obj_loader = (req, res, next) => {
  const obj = {};
  for (const tables of loaderFields) {
    for (const fields of tables[1]) {
      const loaderName = fields.ref + `_` + fields.field + `_Loader`;
      if (fields.field && !obj[loaderName]) {
        const batch = async (idsAndSelections) =>
          batchIdsAndSelections(idsAndSelections, fields);
        obj[loaderName] = new DataLoader(batch);
      }
    }
  }
  req.dataloader = obj;
  next();
};

module.exports = { obj_loader };
