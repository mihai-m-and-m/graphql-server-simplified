/******** Generate Query based on provided Queries object ********/

const { GraphQLList, GraphQLNonNull } = require("graphql");
const { getAllQueries } = require("../../data");
const { types } = require("./functionTypes");
const { filters } = require("../types/filtersTypes");
const { enumTypes } = require("../types/enumTypes");
const { queriesResolvers } = require("../resolvers/resolversQueries");
const { setArgsTypes } = require("../types/fieldsTypes");
const { error_set, errors_logs } = require("../../errors/error_logs");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");

/*****************************************************************
 Assign each field values and resolver for each key inside Query
*****************************************************************/
const setQueriesFields = (fieldName, protect) => {
  fieldName.types === "list" &&
    (fieldName.type = new GraphQLNonNull(
      new GraphQLList(types[`${fieldName.target}Type`])
    ));

  fieldName.types === "single" &&
    (fieldName.type = types[`${fieldName.target}Type`]);

  fieldName.arguments &&
    (fieldName.arguments = setArgsTypes(fieldName.arguments, fieldName.target));

  fieldName.arguments.searchBy &&
    (fieldName.arguments.searchBy.type = filters[`${fieldName.target}Search`]);

  fieldName.arguments.sortBy &&
    (fieldName.arguments.sortBy.type = enumTypes.sort);

  fieldName.resolve = async (parent, args, context, info) => {
    protectQueryAndMutations(protect, context);
    return queriesResolvers(parent, args, context, info, fieldName);
  };

  const field = { type: fieldName.type };
  fieldName.description && (field.description = fieldName.description);
  fieldName.arguments && (field.args = fieldName.arguments);
  fieldName.resolve && (field.resolve = fieldName.resolve);

  return field;
};

/*****************************************************************
 Generate all the Query's based on provided Queries object
*****************************************************************/
let Query = new Map();
for (let i = 0; i < getAllQueries.length; i++) {
  let [queryName, queryValues] = getAllQueries[i];
  try {
    const protect = protectQueryAndMutationsFields(queryName);
    protect && (queryName = protect[0]);

    Query.set(queryName, setQueriesFields(queryValues, protect));
  } catch (err) {
    errors_logs(err);
    error_set("Queries", queryName + queryValues.name + err.message);
  }
}
Query = Object.fromEntries(Query);
module.exports = { Query };
