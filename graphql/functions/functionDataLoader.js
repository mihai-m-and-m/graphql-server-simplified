/******** DataLoader for batching on each request ********/

const DataLoader = require("dataloader");
const { getAllSchemas } = require("../../data");
const { models } = require("./functionModels");
const { find_in_database } = require("../../db/db_query");
const { errors_logs, error_set } = require("../../errors/error_logs");

/******************************************************************************
 Batch all Ids and selected fields from Query and sort them after DB response
******************************************************************************/
const batchIdsAndSelections = async (idsAndSelections, ref) => {
  const { selection } = idsAndSelections[0];
  const sort = {};
  const allIds = [];

  try {
    for (const { ids } of idsAndSelections) {
      ids[0] ? allIds.push(...ids) : allIds.push(ids);
    }

    const getFromDB = await find_in_database(models[ref], allIds, selection);
    getFromDB.forEach((element) => (sort[element.id] = element));

    return idsAndSelections.map((key) => {
      if (key.ids[0])
        return key.ids.map((id) => ({ ids: sort[id.toString()], selection }));
      return { ids: sort[key.ids.toString()], selection };
    });
  } catch (err) {
    errors_logs(err);
    error_set("DataLoader", ref + allIds + err.message);
  }
};

/******************************************************************
 Make for each request one Loader to proper handle database query's
*******************************************************************/
const obj_loader = (req, res, next) => {
  const obj = {};
  for (const [tableName, fields] of getAllSchemas) {
    for (const { ref, field } of fields) {
      const loaderName = ref + `_` + field + `_Loader`;
      if (field && !obj[loaderName]) {
        const batch = async (idsAndSelections) =>
          batchIdsAndSelections(idsAndSelections, ref);
        obj[loaderName] = new DataLoader(batch);
      }
    }
  }
  req.dataloader = obj;
  next();
};

module.exports = { obj_loader };
