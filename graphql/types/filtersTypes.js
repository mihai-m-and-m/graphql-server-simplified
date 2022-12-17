/********************
 ** Define Filters **
 * TODO:   q: { type: GraphQLString },  --------- quantity
 * TODO: sortBy (any field) - Ascendent or Descendent
 * ! ONLY FOR INT FIELDS
 * TODO: views_lt: { type: GraphQLInt },--------- lowerThen
 * TODO: views_lte: { type: GraphQLInt },--------- lowerOrEqualThen
 * TODO: views_gt: { type: GraphQLInt },--------- graterThen
 * TODO: views_gte: { type: GraphQLInt },--------- graterOrEqualThen
 ********************/
const { GraphQLInputObjectType } = require("graphql");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");
const { setTypes } = require("./fieldsTypes");
const { errors_logs, error_set } = require("../../errors/error_logs");

/***************************************************************
 ** Special TimeStamps Input Object to define a range of Dates
 */
const TimeStampsType = new GraphQLInputObjectType({
  name: "TimeStamps",
  fields: {
    from: { type: setTypes("Date") },
    to: { type: setTypes("Date") },
  },
  description:
    "Special type to make `Date` scalar type human readable for example `YYYY-MM-DD`",
});

const PaginationType = new GraphQLInputObjectType({
  name: "Pagination",
  fields: { from: { type: setTypes("Date") }, to: { type: setTypes("Date") } },
  description:
    "Special type to make `Date` scalar type human readable for example `YYYY-MM-DD`",
});

/**************************************************************
 ** Filter Query result based on provided filters in arguments
 * @param {String} fieldName
 * @returns Object with property fields
 */
const filterFields = (fieldName) => {
  let timeStamp;
  const fields = Object.values(fieldName);
  const result = fields.map((item) => {
    if (item.select || item.types === "list") return;

    return { [item.name]: { type: setTypes(item.types) } };
  });

  if (settings.timeStamp)
    timeStamp = {
      createdAt: { type: TimeStampsType },
      updatedAt: { type: TimeStampsType },
    };

  return Object.assign({}, ...result, timeStamp);
};

/****************************************************************
 ** Create Filter Input Object Type and save into "filters" obj
 * @param {String} schema Schema name
 * @returns
 */
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
