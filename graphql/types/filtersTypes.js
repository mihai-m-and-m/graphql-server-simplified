/******** Define Filters ********/

const { GraphQLInputObjectType } = require("graphql");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");
const { setTypes } = require("./fieldsTypes");
const { errors_logs, error_set } = require("../../errors/error_logs");

/* TODO 
  q: { type: GraphQLString },  --------- quantity
  sortBy (any field) - Ascendent or Descendent
  
  ONLY FOR INT FIELDS
  views_lt: { type: GraphQLInt },--------- lowerThen
  views_lte: { type: GraphQLInt },--------- lowerOrEqualThen
  views_gt: { type: GraphQLInt },--------- graterThen
  views_gte: { type: GraphQLInt },--------- graterOrEqualThen
*/
/***********************************************************
 Special TimeStamps Input Object to define a range of Dates
 ***********************************************************/
const timeStampsType = new GraphQLInputObjectType({
  name: "TimeStamps",
  fields: { from: { type: setTypes("Date") }, to: { type: setTypes("Date") } },
  description:
    "Special type to make `Date` scalar type human readable for example `YYYY-MM-DD`",
});

/***********************************************************
 Filter Query result based on provided filters in arguments
 ***********************************************************/
const filterFields = (fieldName) => {
  let timeStamp;
  const field = Object.values(fieldName);
  const result = field.map((item) => {
    if (item.select) return;
    return { [item.name]: { type: setTypes(item.types) } };
  });

  if (settings.timeStamp)
    timeStamp = {
      createdAt: { type: timeStampsType },
      updatedAt: { type: timeStampsType },
    };

  return Object.assign({}, ...result, timeStamp);
};

/***********************************************************
 Create Filter Input Object Type and save into "filters" obj
 ***********************************************************/
const createFilterInput = (schema) => {
  let schemaName = schema[0];
  const fields = schema[1];
  try {
    schemaName = new GraphQLInputObjectType({
      name: schemaName + "Search",
      fields: filterFields(fields),
      description:
        "Get specific items which includes parts of one or multiple arguments.",
    });

    return schemaName;
  } catch (err) {
    errors_logs(err);
    error_set("createFilterInput", schemaName + err.message);
  }
};

let filters = {};
for (let i = 0; i < getAllSchemas.length; i++) {
  if (!getAllSchemas[i][0].includes("__noDB"))
    filters[getAllSchemas[i][0] + `Search`] = createFilterInput(
      getAllSchemas[i]
    );
}

module.exports = { filters, filterFields };
