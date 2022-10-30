/******** Generate Query based on data.json file ********/

const { GraphQLList, GraphQLNonNull } = require("graphql");
const { Queries } = require("../../data.json");
const { types } = require("../types/functionTypes");
const { filters } = require("../filters/filters");
const { enumTypes } = require("../types/enumTypes");
const { queriesResolvers } = require("../resolvers/resolversQueries");
const { setArgsTypes } = require("../types/fieldsTypes");
const { error_set } = require("../../errors/error_logs");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");

const queries = Object.entries(Queries);

/*****************************************************************
 Assign each field values and resolver for each key inside Query
*****************************************************************/
const setQueriesFields = (fieldName, protect) => {
  try {
    fieldName.types === "list" &&
      (fieldName.type = new GraphQLNonNull(
        new GraphQLList(types[`${fieldName.target}Type`])
      ));

    fieldName.types === "single" &&
      (fieldName.type = types[`${fieldName.target}Type`]);

    fieldName.resolve = async (parent, args, context, info) => {
      protectQueryAndMutations(protect, context);
      return queriesResolvers(parent, args, context, info, fieldName);
    };

    fieldName.args &&
      (fieldName.args = setArgsTypes(fieldName.args, fieldName.target));

    fieldName.args.searchBy &&
      (fieldName.args.searchBy.type = filters[`${fieldName.target}Search`]);

    fieldName.args.sortBy && (fieldName.args.sortBy.type = enumTypes.sort);

    const field = { type: fieldName.type };
    fieldName.description && (field.description = fieldName.description);
    fieldName.args && (field.args = fieldName.args);
    fieldName.resolve && (field.resolve = fieldName.resolve);

    return field;
  } catch (err) {
    error_set("setQueriesFields", fieldName + err);
  }
};

/*****************************************************************
 Generate all the Query's based on data.json file
*****************************************************************/
const createQuerys = () => {
  try {
    let obj = {};
    for (let i = 0; i < queries.length; i++) {
      let queryName = queries[i][0];
      const queryValues = queries[i][1];

      const protect = protectQueryAndMutationsFields(queryName);
      protect && (queryName = protect[0]);

      obj[queryName] = setQueriesFields(queryValues, protect);
    }
    return obj;
  } catch (err) {
    error_set("createQuerys", queries + err);
  }
};
const Query = createQuerys();

module.exports = { Query, setQueriesFields };

/* example

const getUser = {
  type: UserType,
  description: "Get one user",
  args: { id: { type: GraphQLString } },
  resolve(parent, args) {
    return User.findById(args.id);
  },
};

*/
