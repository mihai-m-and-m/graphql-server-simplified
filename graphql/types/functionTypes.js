/******** FILE FORMAT 
1. 
********/

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
  GraphQLBoolean,
  GraphQLFloat,
} = require("graphql");
const { Schemas } = require("../../data.json");
const { nestedQueryResolvers } = require("../resolvers/resolversQueries");
const { error_set } = require("../../errors/error_logs");

var keys = Object.keys(Schemas);
var values = Object.values(Schemas);

const objectTypes = (schemaName) => {
  try {
    const TypesFields = Object.values(Schemas[schemaName]);
    const newObject = Object.assign(
      {},
      ...TypesFields.map((item) => {
        if (item.types === "Str") item.type = GraphQLString;
        else if (item.types === "Int") item.type = GraphQLInt;
        else if (item.types === "ID") item.type = GraphQLID;
        else if (item.types === "Boolean") item.type = GraphQLBoolean;
        else if (item.types === "Float") item.type = GraphQLFloat;
        if (item.types === "list" || item.types === "single") {
          if (item.types === "list")
            item.type = new GraphQLList(types[`${item.ref}Type`]);
          if (item.types === "single") item.type = types[`${item.ref}Type`];
          if (item.required) item.type = new GraphQLNonNull(item.type);
          return {
            [item.name]: {
              type: item.type,
              resolve(parent, args, info) {
                return nestedQueryResolvers(parent, args, info, item);
              },
            },
          };
        }
        if (item.required && !item.select)
          item.type = new GraphQLNonNull(item.type);
        return { [item.name]: { type: item.type } };
      })
    );
    if (!`${schemaName}`.includes("_noDB", -1)) {
      newObject.createdAt = { type: new GraphQLNonNull(GraphQLString) };
      newObject.updatedAt = { type: new GraphQLNonNull(GraphQLString) };
    }
    return newObject;
  } catch (err) {
    error_set("objectTypes", schemaName + err);
  }
};

const createType = (schemaName, fields) => {
  try {
    schemaName = new GraphQLObjectType({
      name: schemaName,
      fields: () => (fields ? fields : objectTypes(schemaName)),
    });
    return schemaName;
  } catch (err) {
    error_set("createType", schemaName + fields + err);
  }
};

let types = {};
for (let i = 0; i < values.length; i++) {
  types[keys[i] + `Type`] = createType(keys[i]);
}

module.exports = { types, createType, objectTypes };

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
