/* 

First step is to rename .env.RENAME file to .env and to set databasse connection
Second step change the next settings as you wish.

*/

const settings = {
  database: "mongodb", // mongodb or TODO mysql
  backend: "graphql", // graphql API or TODO REST API
  timeStamp: true, // only avalaible for mongodb
};

module.exports = { settings };
