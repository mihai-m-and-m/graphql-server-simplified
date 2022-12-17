/********************************************
 ** Create GraphQL Types and Nested Fields **
 ********************************************/
const { GraphQLObjectType, GraphQLList, GraphQLNonNull } = require("graphql");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");
const { nestedQueryResolvers } = require("../resolvers/resolversQueries");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { resolverDateFormat } = require("../resolvers/resolversDate");
const { dateFormatEnum } = require("../types/enumTypes");
const {
  setTypes,
  setTimeStamp,
  setPaginationFields,
} = require("../types/fieldsTypes");

/***********************************************************************
 ** Assign each schema field "types" and "resolver" for "nested fields"
 * @param {*} Schema
 * @returns
 */
const schemafieldsTypes = ([schemaName, fields]) => {
  const fieldsTypes = fields.map((field) => {
    const { name, types, args, ref, description, required, select } = field;
    const fieldType = getAllTypes[`${ref}Type`];
    let result = {};

    if (select) return;
    if (args) result.args = args;
    if (!ref) result.type = setTypes(types);
    if (description) result.description = description;
    if (types.includes("single")) result.type = fieldType;
    if (types.includes("list")) {
      result.type = new GraphQLList(fieldType);
      result.args = setPaginationFields();
    }
    if (required && !select) result.type = new GraphQLNonNull(result.type);

    if (types.includes("Date")) {
      result.args = { date: { type: dateFormatEnum } };
      result.resolve = (parent, args) =>
        resolverDateFormat(parent[name], args.date);
    }

    if (ref)
      result.resolve = (parent, args, context, info) => {
        return nestedQueryResolvers(parent, args, context, info, field);
      };

    return { [name]: result };
  });

  let schemaFields = Object.assign({}, ...fieldsTypes);
  if (!schemaName.includes("__noDB", -1) && settings.timeStamp)
    schemaFields = { ...schemaFields, ...setTimeStamp() };

  return schemaFields;
};

/***************************************
 ** Create GraphQL Types from Schemas
 */
let getAllTypes = new Map();
const createType = (schema) => {
  let schemaName = schema[0];
  schemaName = new GraphQLObjectType({
    name: schemaName,
    fields: () => schemafieldsTypes(schema),
  });
  return schemaName;
};

for (let i = 0; i < getAllSchemas.length; i++) {
  try {
    getAllTypes.set(`${getAllSchemas[i][0]}Type`, createType(getAllSchemas[i]));
  } catch (err) {
    errors_logs(err);
    error_set("createType", err.message);
  }
}

getAllTypes = Object.fromEntries(getAllTypes);
module.exports = { getAllTypes };
