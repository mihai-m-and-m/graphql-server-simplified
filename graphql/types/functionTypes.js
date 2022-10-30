/******** Create G'QL Types and Nested Fields *******/

const { GraphQLObjectType, GraphQLList, GraphQLNonNull } = require("graphql");
const { Schemas } = require("../../data.json");
const { settings } = require("../../settings");
const { nestedQueryResolvers } = require("../resolvers/resolversQueries");
const { error_set } = require("../../errors/error_logs");
const {
  setTypes,
  setTimeStamp,
  setPaginationFields,
} = require("./fieldsTypes");

const schema = Object.entries(Schemas);

/*********************************************************************
 Assign each schema field "types" and "resolver" for "nested fields"
*********************************************************************/
const schemafieldsTypes = (schema) => {
  const schemaName = schema[0];
  const fields = Object.values(schema[1]);
  try {
    let field = Object.assign(
      {},
      ...fields.map((field) => {
        let result = {};
        if (field.select) return;

        if (!field.ref) result.type = setTypes(field.types);

        if (field.types.includes("list")) {
          result.type = new GraphQLList(types[`${field.ref}Type`]);
          result.args = setPaginationFields();
        }

        if (field.types.includes("single"))
          result.type = types[`${field.ref}Type`];

        if (field.required && !field.select)
          result.type = new GraphQLNonNull(result.type);

        if (field.ref)
          result.resolve = (parent, args, context, info) => {
            return nestedQueryResolvers(parent, args, context, info, field);
          };

        return { [field.name]: result };
      })
    );

    if (!schemaName.includes("__noDB", -1) && settings.timeStamp)
      field = { ...field, ...setTimeStamp() };

    return field;
  } catch (err) {
    error_set("objectTypes", schemaName + err);
  }
};

/**********************************
 Create GraphQL Types from Schemas
***********************************/
const createType = (schema) => {
  try {
    let schemaName = schema[0];
    schemaName = new GraphQLObjectType({
      name: schemaName,
      fields: () => schemafieldsTypes(schema),
    });
    return schemaName;
  } catch (err) {
    error_set("createType", err);
  }
};

let types = {};
for (let i = 0; i < schema.length; i++) {
  types[schema[i][0] + `Type`] = createType(schema[i]);
}

module.exports = { types, createType };

/* Create Custom Types in diferent file
//
// const { createType, objectTypes } = require("../types/functionTypes");
// const fields = { id: { type: GraphQLString }, name: { type: GraphQLString }, };
// console.log(createType("Users", fields));

- will create: 

const OrderType = new GraphQLObjectType({
  name: "Order",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    orderItems: {
      type: GraphQLList(ProductType),
      resolve(parent, args) {
        return Products.findById(parent.id);
      },
    },
    shippingAddress: { type: GraphQLString },
  }),
});

*/
