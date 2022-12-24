/********************
 ** Define Filters **
 * TODO:   q: { type: GraphQLString },  --------- quantity
 ********************/
const { GraphQLInputObjectType } = require("graphql");
const { settings } = require("../../settings");
const { setTypes } = require("./fieldsTypes");
const { errors_logs, error_set } = require("../../errors/error_logs");
const { sortByEnum } = require("./enumTypes");

/***************************************************************
 ** Special TimeStamps Input Object to define a range of Dates
 */
const timeStampsType = new GraphQLInputObjectType({
  name: "TimeStamps",
  fields: {
    from: { type: setTypes("Date") },
    to: { type: setTypes("Date") },
  },
  description: "Special type to make `Date` scalar type human readable for example `YYYY-MM-DD`",
});

/***************************************************************
 ** Special SortBy Input Object to sort by different operations
 */
const sortByType = new GraphQLInputObjectType({
  name: "Sort",
  fields: {
    order: { type: sortByEnum },
    eq: { type: setTypes("Float"), description: "Equal to" },
    ne: { type: setTypes("Float"), description: "Not equal to" },
    lt: { type: setTypes("Float"), description: "Lower than" },
    lte: { type: setTypes("Float"), description: "Lower or equal than" },
    gt: { type: setTypes("Float"), description: "Greater than" },
    gte: { type: setTypes("Float"), description: "Greater or equal than" },
  },
  description: "Special type to sort by different operations",
});

/**************************************************************
 ** Filter Query result based on provided filters in arguments
 * @param {object} fieldName
 * @returns Object with property fields
 */
const filterFields = (fieldName, type) => {
  let timeStamp;
  const fields = Object.values(fieldName);
  const opType = ["Int", "Float"];

  const result = fields.map((item) => {
    if (item.select) return;
    // if (settings.database === "mysql") if (item.types === "list") return; //! not sure about this, double check
    if (type === "Sort") {
      if (item.types === "single" || item.types === "ID" || item.types === "list") return;
      if (opType.some((i) => [item.types].includes(i))) return { [item.name]: { type: sortByType } };
      return { [item.name]: { type: sortByEnum } };
    }
    return { [item.name]: { type: setTypes(item.types) } };
  });

  if (settings.timeStamp) {
    if (type === "Sort") timeStamp = { createdAt: { type: sortByEnum }, updatedAt: { type: sortByEnum } };
    else timeStamp = { createdAt: { type: timeStampsType }, updatedAt: { type: timeStampsType } };
  }

  return Object.assign({}, ...result, timeStamp);
};

module.exports = { filterFields };
