/* 

First step is to rename .env.RENAME file to .env and to set databasse connection
Second step change the next settings as you wish.

*/

const settings = {
  database: "mongodb", // mongodb or TODO mysql
  backend: "graphql", // graphql API or TODO REST API
  timeStamp: true, // only avalaible for mongodb
  graphiql: true, // Show graphiQL Interface to test endpoint on localhost
  graphqlDepthLimit: 10, // GraphQL Depth Limit (how deep you are alowed to query)
};

module.exports = { settings };
