/******** FILE FORMAT 
1. 
********/

const { models } = require("../models/functionModels");
const { filterQueryResolvers } = require("../filters/filters");
const { error_set } = require("../../errors/error_logs");
const { date } = require("../../utils/data_formats");
const { find_all_in_database } = require("../../db/db_query");

const nestedQueryResolvers = (parent, args, ctx, item) => {
  try {
    /* TO DO
      - extract the fields required from ctx to specify what to load and dont load twice
      console.log(ctx.dataloader);
      */
    const loaderName = item.ref + `_` + item.field + `_Loader`;
    let result;
    item.types === "list"
      ? (result = ctx.dataloader[loaderName].loadMany(parent[item.name]))
      : (result = ctx.dataloader[loaderName].load(parent[item.name]));
    return result;
  } catch (err) {
    error_set("nestedQueryResolvers", item + err);
  }
};

const queriesResolvers = async (parent, args, fieldName) => {
  try {
    //console.log(fieldName);
    let items = await find_all_in_database(models[fieldName.target]);
    items = filterQueryResolvers(args, items);
    const result = items.map((item) => {
      return {
        ...item._doc,
        _id: item.id,
        createdAt: date(item._doc.createdAt),
        updatedAt: date(item._doc.updatedAt),
      };
    });

    if (fieldName.types === "list") return result;
    else if (fieldName.types === "single") return result[0];
  } catch (err) {
    error_set("queriesResolvers", fieldName + err);
  }
};

module.exports = { queriesResolvers, nestedQueryResolvers };
