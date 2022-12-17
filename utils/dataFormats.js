/********************************************************************
 ** Validate Email address for resolvers                           **
 ** Validate ID format for MongoDB and UUIDv4 for Sequalize        **
 ** Convert date format                                            **
 ********************************************************************/
const { GraphQLScalarType } = require("graphql");
const { error_set } = require("../errors/error_logs");

const validEmail = (email) => {
  const validEmail = /^\w+([\.-] ?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(validEmail)) return email;
  else return error_set("checkValidEmail", email);
};

const validMongoID = (id) => {
  const mongodbID = /^[0-9a-fA-F]{24}$/;
  if (id.toString().match(mongodbID)) return id;
  else return error_set("checkValidID", id);
};

const validUUIDv4 = (id) => {
  const UUIDv4 =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  if (id.toString().match(UUIDv4)) return id;
  else return error_set("checkValidID", id);
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

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

module.exports = { validEmail, validMongoID, validUUIDv4, dateScalar };
