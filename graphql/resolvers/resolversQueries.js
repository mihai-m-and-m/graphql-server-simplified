/******** FILE FORMAT 
1. 
********/

const { models } = require("../functions/functionModels");
const { filterQueryResolvers } = require("../types/filtersTypes");
const { error_set } = require("../../errors/error_logs");
const { date } = require("../../utils/data_formats");
const { find_all_in_database } = require("../../db/db_query");

const getQuerySelections = ({ fieldNodes }) => {
  return fieldNodes
    .map((node) => node.selectionSet.selections)
    .flat()
    .map((s) => s.name.value)
    .join(" ");
};

const nestedQueryResolvers = async (parent, args, context, info, item) => {
  try {
    /* TO DO
      - extract the fields required from ctx to specify what to load and dont load twice
      */
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
    error_set("nestedQueryResolvers", item.name + err);
  }
};

const queriesResolvers = async (parent, args, context, info, fieldName) => {
  try {
    /* TO DO
      - extract the fields required from ctx to specify what to load and dont load twice
      console.log(ctx.dataloader);
      - based on info param choose only the required fields
      */
    const selection = getQuerySelections(info);
    let items = await find_all_in_database(models[fieldName.target], selection);
    items = filterQueryResolvers(args, items);

    // return {
    //   ...item._doc,
    //   _id: item.id,
    //   createdAt: date(item._doc.createdAt),
    //   updatedAt: date(item._doc.updatedAt),
    // };

    const result = items.map((item) => item);
    console.log(result[0].createdAt);
    if (fieldName.types === "list") return result;
    else if (fieldName.types === "single") return result[0];
  } catch (err) {
    error_set("queriesResolvers", fieldName + err);
  }
};

module.exports = { queriesResolvers, nestedQueryResolvers };
