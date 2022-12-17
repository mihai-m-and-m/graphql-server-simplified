/*****************************************************
 ** Generate Query based on provided Queries object **
 *****************************************************/
const { GraphQLList, GraphQLNonNull, GraphQLInt } = require("graphql");
const { getAllQueries } = require("../../data");
const { getAllTypes } = require("./functionTypes");
const { filters } = require("../types/filtersTypes");
const { enumTypes } = require("../types/enumTypes");
const { queriesResolvers } = require("../resolvers/resolversQueries");
const { setArgsTypes } = require("../types/fieldsTypes");
const { error_set, errors_logs } = require("../../errors/error_logs");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");

/*******************************************************************
 ** Assign each field values and resolver for each key inside Query
 * @param {OBJECT} fieldName
 * @param {Array} protect
 * @returns Field Object with properties
 */
const setQueriesFields = (fieldName, protect) => {
  let { types, arguments, target } = fieldName;
  [target, nullTarget] = target.split("!");
  [types, nullType] = types.split("!");
  fieldName.target = target;
  fieldName.types = types;

  let queryType = getAllTypes[`${target}Type`];
  const filter = filters[`${target}Search`];

  if (nullTarget != undefined) queryType = new GraphQLNonNull(queryType);

  types.includes("list")
    ? (fieldName.type = new GraphQLList(queryType))
    : (fieldName.type = queryType);

  if (nullType != undefined)
    fieldName.type = new GraphQLNonNull(fieldName.type);

  arguments && (fieldName.args = setArgsTypes(arguments));
  arguments.searchBy && (fieldName.args.searchBy.type = filter);
  arguments.sortBy && (fieldName.args.sortBy.type = enumTypes.sort);

  fieldName.resolve = async (parent, args, context, info) => {
    protect && protectQueryAndMutations(protect, context);
    let result = queriesResolvers(parent, args, context, info, fieldName);
    return result;
  };

  return fieldName;
};

/*************************************************************
 ** Generate all the Query's based on provided Queries object
 */
let Query = new Map();
for (let i = 0; i < getAllQueries.length; i++) {
  let [queryName, fieldName] = getAllQueries[i];
  try {
    const protect = protectQueryAndMutationsFields(queryName);
    protect && (queryName = protect[0]);
    Query.set(queryName, setQueriesFields(fieldName, protect));
  } catch (err) {
    errors_logs(err);
    error_set("Queries", queryName + fieldName.name + err.message);
  }
}
Query = Object.fromEntries(Query);
module.exports = { Query };
