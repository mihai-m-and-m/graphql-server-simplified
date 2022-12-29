/****************************
 ** Generate All Mutations **
 ****************************/
const { getAllTypes } = require("./functionTypes");
const { getAllMutations } = require("../../data");
const { setArgsTypes } = require("../types/inputTypes");
const { errors_logs, error_set } = require("../../errors/error_logs");
const { protectQueryAndMutations, protectQueryAndMutationsFields } = require("../../middleware/authMiddleware");
const {
  argumentsFunction,
  checkFalseFunction,
  checkTrueFunction,
  saveFunction,
  returnFunction,
} = require("../resolvers/resolversMutations");

/******************************************
 ** Assign for each Mutation resolver:
 ** Arguments,
 ** Checks True - continue if exists in DB
 ** Checks False - continue if not in DB
 ** Savings, Returns, etc...
 * @param {OBJECT} mutation
 * @param {OBJECT} parent
 * @param {ARGUMENTS} args
 * @param {*} req
 * @returns Promise with requested object from database
 */
const mutationResolver = async (mutation, parent, args, req, info) => {
  const { arguments, checksT, checksF, savings, returns } = mutation;
  let returnedObj = {};
  let checks = [];

  const argsObj = await argumentsFunction(arguments, args, req);
  if (checksF) await checkFalseFunction(checksF, args);
  if (checksT) checks = await checkTrueFunction(checksT, argsObj, req);
  const [result, JWTFields] = checks;
  if (savings) returnedObj = await saveFunction(savings, argsObj, result, info);
  if (returns) returnedObj = await returnFunction(returns, result, JWTFields);
  return returnedObj;
};

/***************************************************************
 ** Assign and protect each mutation field values and resolvers
 */
let setAllMutations = new Map();
for (const mutation of getAllMutations) {
  let [mutationName, mutationFields] = mutation;
  const protect = protectQueryAndMutationsFields(mutationName);
  protect && (mutationName = protect[0]);
  try {
    setAllMutations.set(mutationName, {
      type: getAllTypes[`${mutationFields.target}Type`],
      args: setArgsTypes(mutationFields.arguments, mutationFields.target),
      async resolve(parent, args, req, info) {
        protect && protectQueryAndMutations(protect, req);
        return mutationResolver(mutationFields, parent, args, req, info);
      },
    });
  } catch (err) {
    errors_logs(err);
    error_set("Mutations", mutationName + err.message);
  }
}

setAllMutations = Object.fromEntries(setAllMutations);
module.exports = { setAllMutations };
