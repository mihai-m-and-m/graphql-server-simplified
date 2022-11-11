/******** Queries resolvers ********/

const { models } = require("../functions/functionModels");
const { error_set, errors_logs } = require("../../errors/error_logs");
const {
  find_all_in_database,
  find_args_database,
} = require("../../db/db_query");

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
    const { page, perPage = 25 } = args;
    let result;

    if (item.types === "list")
      result = await context.dataloader[loaderName].loadMany([load]);
    else result = await context.dataloader[loaderName].load(load);

    if (page !== undefined && perPage) {
      let start = (page - 1) * perPage;
      let end = page * perPage;
      const data = result[0].map((i) => i.ids);
      return data.slice(start, end);
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
    const model = models[fieldName.target];
    const selection = getQuerySelections(info);
    let arguments = Object.entries(args);
    let items = [];

    if (args.searchBy) arguments = Object.entries(args.searchBy);

    if (arguments.length === 0)
      items = await find_all_in_database(model, selection);
    else {
      const subfields = fieldName.args.searchBy.type._fields;
      items = await find_args_database(model, arguments, selection, subfields);
    }

    const result = items.map((item) => item);
    if (fieldName.types === "list") return result;
    else if (fieldName.types === "single") return result[0];
  } catch (err) {
    errors_logs(err);
    error_set("queriesResolvers", fieldName + err.message);
  }
};

module.exports = { queriesResolvers, nestedQueryResolvers };
