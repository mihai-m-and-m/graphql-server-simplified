/**********************************
 ** Define all the Types for API **
 **********************************/
const { GraphQLString, GraphQLInt, GraphQLID, GraphQLFloat, GraphQLBoolean, GraphQLList, GraphQLNonNull } = require("graphql");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { resolverDateFormat } = require("../resolvers/resolversDate");
const { dateScalar } = require("./scalarTypes");
const { dateFormatEnum } = require("./enumTypes");

/**********************************************************************************************
 ** Configure types for fields inside filters (searchBy, sortBy)
 ** Configure types for arguments of mutations fields used by below "setArgsTypes" function
 * @param {string} fieldType
 * @param {*} type
 * @returns
 */
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

/******************************************************
 ** Configure Time Stamp for each field of the Schema
 */
const setTimeStamp = () => {
  return {
    createdAt: {
      type: dateScalar,
      args: { date: { type: dateFormatEnum } },
      resolve(parent, args) {
        return resolverDateFormat(parent.createdAt, args.date);
      },
    },
    updatedAt: {
      type: dateScalar,
      args: { date: { type: dateFormatEnum } },
      resolve(parent, args) {
        return resolverDateFormat(parent.updatedAt, args.date);
      },
    },
  };
};

/******************************************************************
 ** Configure nested query fields for pagination only for "list" type
 *? page: number of page
 *? perPage: number of items per page (Default 25)
 *******************************************************************/
const setPaginationFields = () => {
  return { page: { type: GraphQLInt }, perPage: { type: GraphQLInt } };
};

module.exports = {
  setTypes,
  setTimeStamp,
  setPaginationFields,
};
