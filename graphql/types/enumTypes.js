/******** FILE FORMAT 
1. TODO
********/

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
const types = require("../types/functionTypes");
const { searchSchemas, getSchemas } = require("../models/functionModels");

const { fieldsTypes } = require("../types/functionTypes");

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
