/******** Define EnumType ********/

const {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
} = require("graphql");

const { searchSchemas, getSchemas } = require("../functions/functionModels");
const { fieldsTypes, types } = require("../functions/functionTypes");

const sort = new GraphQLEnumType({
  name: "Sort",
  values: {
    ASC: {
      value: 0,
    },
    DESC: {
      value: 1,
    },
  },
});

const enumTypes = { sort };

module.exports = { enumTypes };
