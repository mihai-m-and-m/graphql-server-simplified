/******** Generate All Mutations ********/

const { types } = require("./functionTypes");
const { getAllMutations } = require("../../data");
const { setArgsTypes } = require("../types/fieldsTypes");
const { mutation_resolver } = require("../resolvers/resolversMutations");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");
const { errors_logs, error_set } = require("../../errors/error_logs");

/***********************************************************
 Assign and protect each mutation field values and resolvers
 ***********************************************************/
let setAllMutations = {};
for (const mutation of getAllMutations) {
  const mutationFields = mutation[1];
  let mutationName = mutation[0];
  try {
    const protect = protectQueryAndMutationsFields(mutationName);
    protect && (mutationName = protect[0]);

    setAllMutations[mutationName] = {
      type: types[`${mutationFields.target}Type`],
      args: setArgsTypes(mutationFields.args),
      async resolve(parent, args, req) {
        protectQueryAndMutations(protect, req);
        return mutation_resolver(mutationFields, parent, args, req);
      },
    };
  } catch (err) {
    errors_logs(err);
    error_set("Mutations", mutationName + err.message);
  }
}

module.exports = { setAllMutations };
