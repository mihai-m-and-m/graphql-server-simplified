/******** Define Query and Mutations ********/

const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const { Query } = require("./functions/functionQueries");
const { setAllMutations } = require("./functions/FunctionMutations");

// Define GraphQL SCHEMA
const graphQLSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Queries",
    description: "All types of Queries (GET method)",
    fields: Query,
  }),
  mutation: new GraphQLObjectType({
    name: "Mutations",
    description: "All Mutations (Create, Update, Delete, etc)",
    fields: setAllMutations,
  }),
});

module.exports = { graphQLSchema };
