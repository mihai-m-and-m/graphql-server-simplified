/*************************
 ** Custom Scalar Types **
 *************************/
const { GraphQLScalarType } = require("graphql");

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description:
    "Special `Date` scalar type that can be represented as any of the following: \n `YYYY, YYYY-MM, YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD`",
  parseValue(value) {
    if (!value) return;
    return new Date(value);
  },
  parseLiteral(ast) {
    if (!isNaN(Date.parse(ast.value)) && ast.kind === "StringValue") {
      return new Date(ast.value);
    }
  },
});

module.exports = { dateScalar };
