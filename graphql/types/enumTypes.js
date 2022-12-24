/**********************
 ** Define EnumTypes **
 **********************/
const { GraphQLEnumType } = require("graphql");

const sortByEnum = new GraphQLEnumType({
  name: "Order",
  values: {
    ASC: {
      value: "ASC",
      description: "Ascending order (numeric or string)",
    },
    DESC: {
      value: "DESC",
      description: "Descending order (numeric or string)",
    },
  },
});

const dateFormatEnum = new GraphQLEnumType({
  name: "DateFormat",
  values: {
    LocaleDate: {
      value: 0,
      description: "Example: 10/28/2040",
    },
    LocaleTime: {
      value: 1,
      description: "Example: 23:58:18",
    },
    Date: {
      value: 2,
      description: "Example: Sun Oct 28 2040",
    },
    GMT: {
      value: 3,
      description: "Example: Sun, 28 Oct 2040 23:58:18 GMT",
    },
    ISO: {
      value: 4,
      description: "Example: 2040-10-28T23:58:18.000Z",
    },

    DateUTC: {
      value: 5,
      description: "Example: Sun Oct 28 2040 23:58:18 GMT+0000 (UTC)",
    },
    TimeUTC: {
      value: 6,
      description: "Example: 23:58:18 GMT+0000 (UTC)",
    },
  },
});

module.exports = { sortByEnum, dateFormatEnum };
