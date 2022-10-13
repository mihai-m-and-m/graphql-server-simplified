/******** FILE FORMAT 
1. 
********/

const data = require("../../data.json");
const { models, searchSchemas } = require("../models/functionModels");
//const types = require("../types/functionTypes");
const { functionBatches } = require("../dataloader/functionDataLoader");
const { filterQueryResolvers } = require("../filters/filters");
const { error_set } = require("../../errors/error_logs");
const { date } = require("../../utils/data_formats");

const load = async (parent, args, context, info, item) => {
  try {
    //const Loaders = context[`${item.ref}_${item.field}_Loader`];
    //console.log(await Loaders.load(parent._id));
    //return Loaders.load(parent._id.toString());
    //return await models[item.ref].find({ [item.field]: parent._id });
  } catch (err) {
    error_set("loadersQueries", item + err);
  }
};

const nestedQueryResolvers = async (parent, args, info, item) => {
  try {
    const items = await models[item.ref].find({
      _id: { $in: parent[item.name] },
    });
    const result = items.map((e) => {
      return { ...e._doc, _id: e.id };
    });
    if (item.types === "list") return result;
    else if (item.types === "single") return result[0];
  } catch (err) {
    error_set("nestedQueryResolvers", item + err);
  }
};

const queriesResolvers = async (parent, args, fieldName) => {
  try {
    let items = await models[fieldName.target].find();
    if (args.searchBy) items = filterQueryResolvers(args.searchBy, items);
    else items = filterQueryResolvers(args, items);

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
