/******** FILE FORMAT 
1. Assign each field values and resolver for each key inside Query 
2. generate all the Query's based on data.json file
********/

const { GraphQLList, GraphQLNonNull } = require("graphql");
const { Queries } = require("../../data.json");
const { types } = require("../types/functionTypes");
const { queriesResolvers } = require("../resolvers/resolversQueries");
const { error_set } = require("../../errors/error_logs");
const { setArgsTypes } = require("../types/fieldsTypes");
const { filters } = require("../filters/filters");

//
// 1. Assign each field values and resolver for each key inside Query
//
const setQueriesFields = (fieldName, protect) => {
  try {
    fieldName.types === "list" &&
      (fieldName.type = new GraphQLNonNull(
        new GraphQLList(types[`${fieldName.target}Type`])
      ));

    fieldName.types === "single" &&
      (fieldName.type = types[`${fieldName.target}Type`]);

    fieldName.resolve = (parent, args, req) => {
      /* TO DO
      - extract the protect (auth and admin) to separate function from "mutation" and "functionQueries" x 2
      //console.log(req.dataloader);
      */

      if (protect && !req.isAuth) error_set("checkisAuth", req.isAuth);
      const level = req?.token?.info?.adminlevel;
      if (protect && protect[2] && level >= 0 && !(level >= protect[2]))
        error_set("checkisAdmin", protect[2]);
      return queriesResolvers(parent, args, fieldName);
    };

    fieldName.args &&
      (fieldName.args = setArgsTypes(fieldName.args, fieldName.target));

    fieldName.args.searchBy &&
      (fieldName.args.searchBy.type = filters[`${fieldName.target}Search`]);

    const field = { type: fieldName.type };
    fieldName.description && (field.description = fieldName.description);
    fieldName.args && (field.args = fieldName.args);
    fieldName.resolve && (field.resolve = fieldName.resolve);
    return field;
  } catch (err) {
    error_set("setQueriesFields", fieldName + err);
  }
};

//
// 2. generate all the Query's based on data.json file
//
const keys = Object.keys(Queries);
const values = Object.values(Queries);
const createQuerys = () => {
  try {
    let obj = {};
    for (let i = 0; i < keys.length; i++) {
      let protect;
      if (keys[i].includes("__")) {
        /* TO DO
      - extract the protect (auth and admin) to separate function from "mutation" and "functionQueries" x 2
      */
        keys[i] = keys[i].split("__");
        if (keys[i][1].includes("auth") || keys[i][1].includes("adminlevel")) {
          protect = keys[i];
        }
        keys[i] = keys[i][0];
      }
      obj[keys[i]] = setQueriesFields(values[i], protect);
    }
    return obj;
  } catch (err) {
    error_set("createQuerys", keys + err);
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
