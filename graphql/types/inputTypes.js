/************************
 ** Custom Input types **
 ************************/
const { GraphQLInputObjectType } = require("graphql");
const { getAllSchemas } = require("../../data");
const { filterFields } = require("./filtersTypes");
const { setTypes } = require("./fieldsTypes");

/****************************************************************
 ** Create Input Object Type and save into "filters" obj
 * @param {array} schema Schema name
 * @param {string} type Type of filter
 * @param {string} description Description of filter
 * @returns
 */
const createFilterInput = (schema, type, description) => {
  let [schemaName, fields] = schema;
  schemaName = new GraphQLInputObjectType({ name: schemaName + type, fields: filterFields(fields, type), description });
  return schemaName;
};

/********************************************************
 ** Configure types for arguments of mutations fields
 ** Configure types for arguments of query fields
 * @param {object} object Arguments object
 * @param {string} targetName Target name
 * @returns
 */
const setArgsTypes = (object, targetName) => {
  const types = Object.entries(object);
  let obj = {};
  for (const type of types) {
    const [argName, argType] = type;
    obj[argName] = (argName, { type: setTypes(argType, targetName) });
  }
  return obj;
};

const filterFunction = () => {
  const filters = new Map();
  const searchText = "Get specific items which includes parts of one or multiple arguments.";
  const sortText = "Sort by specific item/column, Ascending or Descending.";
  for (let i = 0; i < getAllSchemas.length; i++) {
    if (!getAllSchemas[i][0].includes("__noDB")) {
      const searchName = `${getAllSchemas[i][0]}Search`;
      const sortName = `${getAllSchemas[i][0]}Sort`;
      filters.set(searchName, createFilterInput(getAllSchemas[i], "Search", searchText));
      filters.set(sortName, createFilterInput(getAllSchemas[i], "Sort", sortText));
    }
  }
  return filters;
};

const filters = filterFunction();
module.exports = { filters, setArgsTypes };
