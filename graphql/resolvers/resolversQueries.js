/******** Queries resolvers ********/

const { models } = require("../functions/functionModels");
const { filterQueryResolvers } = require("../types/filtersTypes");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { date } = require("../../utils/data_formats");
const { find_all_in_database } = require("../../db/db_query");

/***********************************************************
 Select "fieldNodes" from query (selected fields to query DB)
 ***********************************************************/
const getQuerySelections = ({ fieldNodes }) => {
  return fieldNodes
    .map((node) => node.selectionSet.selections)
    .flat()
    .map((s) => s.name.value)
    .join(" ");
};

/****************************************************************
 Query resolvers for nested fields with DataLoader for perfomarce
 ****************************************************************/
const nestedQueryResolvers = async (parent, args, context, info, item) => {
  try {
    const ids = parent[item.name];
    const load = { ids, selection: getQuerySelections(info) };
    const loaderName = item.ref + `_` + item.field + `_Loader`;
    let result;

    if (item.types === "list")
      result = await context.dataloader[loaderName].loadMany([load]);
    else result = await context.dataloader[loaderName].load(load);

    if (args.start || args.end) {
      const data = result[0].map((i) => i.ids);
      return data.slice(args.start - 1, args.end);
    }

    if (ids.length === 0) return [];
    if (item.types === "single") return result.ids;
    return result[0].map((i) => i.ids);
  } catch (err) {
    errors_logs(err);
    error_set("nestedQueryResolvers", item.name + err.message);
  }
};

/****************************************************************
 Main Query resolvers fields with DataLoader for perfomarce
 ****************************************************************/
const queriesResolvers = async (parent, args, context, info, fieldName) => {
  try {
    const selection = getQuerySelections(info);
    let items = await find_all_in_database(models[fieldName.target], selection);
    items = filterQueryResolvers(args, items);

    let result = items.map((item) => {
      if (selection.includes("createdAt"))
        return { ...item._doc, createdAt: date(item.createdAt) };
      if (selection.includes("updatedAt"))
        return { ...item._doc, updatedAt: date(item.updatedAt) };
      return item._doc;
    });

    if (fieldName.types === "list") return result;
    else if (fieldName.types === "single") return result[0];
  } catch (err) {
    errors_logs(err);
    error_set("queriesResolvers", fieldName + err.message);
  }
};

module.exports = { queriesResolvers, nestedQueryResolvers };
