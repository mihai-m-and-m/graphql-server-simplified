/******** Define Query and Mutations ********/

const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const { Query } = require("./functions/functionQueries");
const { setAllMutations } = require("./functions/FunctionMutations");

// Define QueryType
const Queries = new GraphQLObjectType({
  name: "Queries",
  description: "All types of Queries (GET method)",
  fields: Query,
});

// Define MutationType
const Mutation = new GraphQLObjectType({
  name: "Mutations",
  description: "All Mutations (Create, Update, Delete, etc)",
  fields: setAllMutations,
});

module.exports = new GraphQLSchema({
  query: Queries,
  mutation: Mutation,
});
