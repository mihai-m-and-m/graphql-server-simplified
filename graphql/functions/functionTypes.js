/******** Create GraphQL Types and Nested Fields *******/

const { GraphQLObjectType, GraphQLList, GraphQLNonNull } = require("graphql");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");
const { nestedQueryResolvers } = require("../resolvers/resolversQueries");
const { error_set, errors_logs } = require("../../errors/error_logs");
const {
  setTypes,
  setTimeStamp,
  setPaginationFields,
} = require("../types/fieldsTypes");
const { resolverDateFormat } = require("../resolvers/resolversDate");
const { dateFormatEnum } = require("../types/enumTypes");

/*********************************************************************
 Assign each schema field "types" and "resolver" for "nested fields"
*********************************************************************/
const schemafieldsTypes = ([schemaName, fields]) => {
  const fieldsTypes = fields.map((field) => {
    let result = {};
    if (field.select) return;
    if (field.args) result.args = field.args;
    if (!field.ref) result.type = setTypes(field.types);
    if (field.description) result.description = field.description;
    if (field.types.includes("single")) result.type = types[`${field.ref}Type`];
    if (field.types.includes("list")) {
      result.type = new GraphQLList(types[`${field.ref}Type`]);
      result.args = setPaginationFields();
    }
    if (field.required && !field.select)
      result.type = new GraphQLNonNull(result.type);

    if (field.types.includes("Date")) {
      result.args = { date: { type: dateFormatEnum } };
      result.resolve = (parent, args) =>
        resolverDateFormat(parent[field.name], args.date);
    }

    if (field.ref)
      result.resolve = (parent, args, context, info) =>
        nestedQueryResolvers(parent, args, context, info, field);

    return { [field.name]: result };
  });

  let schemaFields = Object.assign({}, ...fieldsTypes);
  if (!schemaName.includes("__noDB", -1) && settings.timeStamp)
    schemaFields = { ...schemaFields, ...setTimeStamp() };

  return schemaFields;
};

/**********************************
 Create GraphQL Types from Schemas
***********************************/
const types = {};
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
    types[getAllSchemas[i][0] + `Type`] = createType(getAllSchemas[i]);
  } catch (err) {
    errors_logs(err);
    error_set("createType", err.message);
  }
}

module.exports = { types };
