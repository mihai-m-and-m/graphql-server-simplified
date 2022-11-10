/******** Define all the Types for API ********/

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
const { dateScalar } = require("../../utils/data_formats");

/****************************************************************************************
 Configure types for fields inside filters (searchBy, sortBy)
 Configure types for arguments of mutations fields used by below "setArgsTypes" function 
*****************************************************************************************/
const setTypes = (fieldType, type = {}) => {
  const stringType = ["Str", "email", "encrypt", "jwt"];
  const idType = ["ID", "single", "__id"];

  if (stringType.some((item) => fieldType.includes(item))) type = GraphQLString;
  if (idType.some((item) => fieldType.includes(item))) type = GraphQLID;
  if (fieldType.includes("Int")) type = GraphQLInt;
  if (fieldType.includes("Boolean")) type = GraphQLBoolean;
  if (fieldType.includes("Float")) type = GraphQLFloat;
  if (fieldType.includes("Date")) type = dateScalar;
  if (fieldType.includes("list")) type = new GraphQLList(GraphQLID);
  if (fieldType.includes("!", -1)) type = new GraphQLNonNull(type);

  return type;
};

/******************************************************************
 Configure Time Stamp for each field of the Schema
*******************************************************************/
const setTimeStamp = (field = {}) => {
  field.createdAt = { type: new GraphQLNonNull(GraphQLString) };
  field.updatedAt = { type: new GraphQLNonNull(GraphQLString) };
  return field;
};

/******************************************************************
 Configure nested query fields for pagination only for "list" type
 Start: number to start from
 End: end number of list items
*******************************************************************/
const setPaginationFields = () => {
  return { start: { type: GraphQLInt }, end: { type: GraphQLInt } };
};

/**************************************************
 Configure types for arguments of mutations fields 
 Configure types for arguments of query fields 
***************************************************/
const setArgsTypes = (object) => {
  const types = Object.entries(object);
  let obj = {};

  try {
    for (const type of types) {
      const argName = type[0];
      const argType = type[1];
      obj[argName] = (argName, { type: setTypes(argType) });
    }
    return obj;
  } catch (err) {
    errors_logs(err);
    error_set("setFieldsTypes", object + err.message);
    throw err;
  }
};

module.exports = { setTypes, setArgsTypes, setTimeStamp, setPaginationFields };
