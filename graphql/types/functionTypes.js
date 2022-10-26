/******** FILE FORMAT 
1. 
********/

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLString,
} = require("graphql");
const { Schemas } = require("../../data.json");
const { nestedQueryResolvers } = require("../resolvers/resolversQueries");
const { error_set } = require("../../errors/error_logs");
const { setTypes } = require("./fieldsTypes");

let object = Object.entries(Schemas);

const objectTypes = (schemaName) => {
  try {
    const TypesFields = Object.values(schemaName);
    const newObject = Object.assign(
      {},
      ...TypesFields.map((item) => {
        let result = {};
        if (item.ref) {
          if (item.types.includes("list")) {
            result.type = new GraphQLList(types[`${item.ref}Type`]);
            result.args = { first: { type: GraphQLInt } };
          }

          item.types.includes("single") &&
            (result.type = types[`${item.ref}Type`]);

          result = {
            ...result,
            resolve(parent, args, info) {
              return nestedQueryResolvers(parent, args, info, item);
            },
          };
        } else {
          result.type = setTypes(item.types);
          if (item.required && !item.select)
            result.type = new GraphQLNonNull(result.type);
        }
        return { [item.name]: result };
      })
    );
    if (!`${schemaName}`.includes("_noDB", -1)) {
      newObject.createdAt = { type: new GraphQLNonNull(GraphQLString) };
      newObject.updatedAt = { type: new GraphQLNonNull(GraphQLString) };
    }
    //console.log(newObject);
    return newObject;
  } catch (err) {
    error_set("objectTypes", schemaName + err);
  }
};

const createType = (schema) => {
  try {
    let schemaName = schema[0];
    let schemaFields = schema[1];

    schemaName = new GraphQLObjectType({
      name: schemaName,
      fields: () => objectTypes(schemaFields),
    });
    return schemaName;
  } catch (err) {
    error_set("createType", err);
  }
};

let types = {};
for (let i = 0; i < object.length; i++) {
  types[object[i][0] + `Type`] = createType(object[i]);
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
