/******** Define Data for Schemas, Queries, Mutations ********/

const { settings } = require("./settings");

const Data = require(settings.data);

const getAllSchemas = Object.entries(Data.Schemas);
const getAllQueries = Object.entries(Data.Queries);
const getAllMutations = Object.entries(Data.Mutations);

module.exports = { getAllSchemas, getAllQueries, getAllMutations };
