/******** FILE FORMAT 
1. 
********/

const {
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLNonNull,
} = require("graphql");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { filters } = require("../filters/filters");

const setTypes = (object, target = "") => {
  const types = Object.entries(object);
  let obj = {};
  let name;
  try {
    for (const type of types) {
      name = GraphQLString;
      if (type[1].includes("Str")) name = GraphQLString;
      if (type[1].includes("Int")) name = GraphQLInt;
      if (type[1].includes("Boolean")) name = GraphQLBoolean;
      if (type[1].includes("Float")) name = GraphQLFloat;
      if (
        type[1].includes("ID") ||
        type[1].includes("single") ||
        type[1].includes("__id")
      )
        name = GraphQLID;
      if (type[1].includes("list")) name = new GraphQLList(GraphQLID);
      if (type[1].includes("!", -1)) name = new GraphQLNonNull(name);

      if (type[0] === "sortBy") name = filters[`${target}Filter`];
      if (type[0] === "searchBy") name = filters[`${target}Search`];

      obj[type[0]] = (type[0], { type: name });
    }
    return obj;
  } catch (err) {
    errors_logs(err);
    error_set("setFieldsTypes", object + target + err);
    throw err;
  }
};

module.exports = { setTypes };
