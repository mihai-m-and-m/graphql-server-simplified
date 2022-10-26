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

const setTypes = (fieldType) => {
  let type;
  const stringType = ["Str", "email", "encrypt", "jwt"];
  const idType = ["ID", "single", "__id"];

  if (stringType.some((item) => fieldType.includes(item))) type = GraphQLString;
  if (idType.some((item) => fieldType.includes(item))) type = GraphQLID;
  if (fieldType.includes("Int")) type = GraphQLInt;
  if (fieldType.includes("Boolean")) type = GraphQLBoolean;
  if (fieldType.includes("Float")) type = GraphQLFloat;
  if (fieldType.includes("list")) type = new GraphQLList(GraphQLID);
  if (fieldType.includes("!", -1)) type = new GraphQLNonNull(type);

  return type;
};

const setArgsTypes = (object, target = "") => {
  const types = Object.entries(object);

  let obj = {};
  try {
    for (const type of types) {
      obj[type[0]] = (type[0], { type: setTypes(type[1]) });
    }

    return obj;
  } catch (err) {
    errors_logs(err);
    error_set("setFieldsTypes", object + target + err);
    throw err;
  }
};

module.exports = { setTypes, setArgsTypes };
