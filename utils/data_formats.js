/******** 
1. Validate Email address for resolvers
2. Convert date format
********/
const { GraphQLScalarType } = require("graphql");

const validEmail = () => {
  const validEmail = /^\w+([\.-] ?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return validEmail;
};

const dateScalar = new GraphQLScalarType({
  name: "Date",
  description:
    "Special `Date` scalar type that can be represented as any of the following: \n `YYYY, YYYY-MM, YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD`",
  parseValue(value) {
    if (!value) return;
    return new Date(value);
  },
  serialize(value) {
    if (!value) return;
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (!isNaN(Date.parse(ast.value)) && ast.kind === "StringValue") {
      return new Date(ast.value);
    }
  },
});

const timeStampsTransform = ({ createdAt, updatedAt }) => {
  return {
    createdAt: dateScalar.serialize(createdAt),
    updatedAt: dateScalar.serialize(updatedAt),
  };
};

module.exports = { validEmail, dateScalar, timeStampsTransform };
