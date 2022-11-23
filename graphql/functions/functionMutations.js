/******** Generate All Mutations ********/

const { types } = require("./functionTypes");
const { getAllMutations } = require("../../data");
const { setArgsTypes } = require("../types/fieldsTypes");
const { errors_logs, error_set } = require("../../errors/error_logs");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");
const {
  argumentsFunction,
  checkFalseFunction,
  checkTrueFunction,
  saveFunction,
  returnFunction,
} = require("../resolvers/resolversMutations");

/*********************************************************************
 Assign for each Mutation resolver (Arguments, Checks True(if exists),
 Checks False(if not in DB), Savings, Returns, etc...) 
*********************************************************************/
const mutation_resolver = async (mutation, parent, args, req) => {
  const { arguments, checksT, checksF, saving, returns } = mutation;
  let returnedObj = {};
  let checks = [];
  const argsObj = await argumentsFunction(arguments, args, req);
  if (checksF) await checkFalseFunction(checksF, args);
  if (checksT) checks = await checkTrueFunction(checksT, argsObj);
  const [result, JWTFields] = checks;
  if (saving) returnedObj = await saveFunction(saving, argsObj, result);
  if (returns) returnedObj = await returnFunction(returns, result, JWTFields);
  return returnedObj;
};

/***********************************************************
 Assign and protect each mutation field values and resolvers
 ***********************************************************/
let setAllMutations = new Map();
for (const mutation of getAllMutations) {
  let [mutationName, mutationFields] = mutation;
  try {
    const protect = protectQueryAndMutationsFields(mutationName);
    protect && (mutationName = protect[0]);

    setAllMutations.set(mutationName, {
      type: types[`${mutationFields.target}Type`],
      args: setArgsTypes(mutationFields.arguments),
      async resolve(parent, args, req) {
        protectQueryAndMutations(protect, req);
        return mutation_resolver(mutationFields, parent, args, req);
      },
    });
  } catch (err) {
    errors_logs(err);
    error_set("Mutations", mutationName + err.message);
  }
}

setAllMutations = Object.fromEntries(setAllMutations);

module.exports = { setAllMutations };
