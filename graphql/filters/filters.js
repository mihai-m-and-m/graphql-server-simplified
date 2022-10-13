/******** FILE FORMAT 
1. 
********/

const {
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLID,
} = require("graphql");

const { getSchemas } = require("../models/functionModels");
const { Schemas } = require("../../data.json");

var keys = Object.keys(Schemas);

const filterQueryResolvers = (values, items) => {
  Object.keys(values).forEach((key) => {
    items = items.filter(
      (d) =>
        d[key] &&
        d[key]
          .toString()
          .toLowerCase()
          .includes(values[key].toString().toLowerCase())
    );
  });
  return items;
};

const filterFields = (fieldName) => {
  try {
    const newObject = Object.assign(
      {},
      ...fieldName.map((item) => {
        if (item.types === "Str") item.type = GraphQLString;
        else if (item.types === "Int") item.type = GraphQLInt;
        else if (item.types === "single") item.type = GraphQLID;
        else if (item.types === "Boolean") item.type = GraphQLBoolean;
        else if (item.types === "Float") item.type = GraphQLFloat;
        else if (item.types === "ID" || item.types === "list")
          item.type = new GraphQLList(GraphQLID);
        else item.type = GraphQLString;
        const field = { [item.name]: { type: item.type } };
        return field;
      })
    );
    return newObject;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const b = {
  q: { type: GraphQLString },
  id: { type: GraphQLString },
  title: { type: GraphQLString },
  views: { type: GraphQLInt },
  views_lt: { type: GraphQLInt },
  views_lte: { type: GraphQLInt },
  views_gt: { type: GraphQLInt },
  views_gte: { type: GraphQLInt },
  user_id: { type: GraphQLString },
};

const createFilterInput = (schemaName, filterName) => {
  try {
    schemaName = new GraphQLInputObjectType({
      name: schemaName + filterName,
      fields: filterFields(getSchemas(schemaName)),
    });
    if (filterName === "Filter")
      schemaName.description =
        "Get specific items equal to one or multiple arguments. \n\n\n INFO: all fileds of type `ID` can't be used with multiple arguments";
    if (filterName === "Search")
      schemaName.description =
        "Get specific items which includes parts of one or multiple arguments.";
    return schemaName;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const filtersObj = () => {
  try {
    let obj = {};
    for (let i = 0; i < keys.length; i++) {
      obj[keys[i] + `Filter`] = createFilterInput(keys[i], "Filter");
      obj[keys[i] + `Search`] = createFilterInput(keys[i], "Search");
    }
    return obj;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
const filters = filtersObj();

module.exports = { filters, filterQueryResolvers, filterFields };
