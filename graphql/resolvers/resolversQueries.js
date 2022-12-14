/***********************
 ** Queries resolvers **
 ***********************/
const { error_set, errors_logs } = require("../../errors/error_logs");
const { groupSQLList } = require("../../utils/groupResult");
const { findAllInDB, findWithArgsInDB } = require("../../db/dbQuery");
const { settings } = require("../../settings");

/***************************************************************
 ** Select "fieldNodes" from query (selected fields to query DB)
 * TODO: getQuerySubSelections AND getQuerySubArguments
 */
const getQuerySelections = ({ fieldNodes }) => {
  return fieldNodes
    .map((node) => node.selectionSet.selections)
    .flat()
    .map((s) => s.name.value)
    .join(" ");
};

const getQuerySubSelections = ({ fieldNodes }) => {
  const a = fieldNodes.map((node) => node.selectionSet.selections).flat();
  const b = a.map((node) => node.selectionSet?.selections).flat();
  const c = b.map((node) => node?.name?.value).filter((i) => i);
};

const getQuerySubArguments = ({ fieldNodes }) => {
  return fieldNodes
    .map((node) => node.selectionSet.selections)
    .flat()
    .filter((s) => s.arguments && s.arguments.length)
    .map((s) => s.arguments)
    .flat()
    .filter((a) => a.kind === "Argument");
};

/********************************************************************
 ** Query resolvers for nested fields with DataLoader for perfomarce
 * @param {OBJECT} parent
 * @param {ARGUMENTS} args
 * @param {CONTEXT} context
 * @param {INFO} info
 * @param {FIELD} item
 * @returns Promise with all data retrived from database
 */
const nestedQueryResolvers = async (parent, args, context, info, item) => {
  const { name, types, ref, field } = item;
  const loaderName = `${ref}_${field}_Loader`;
  const selection = getQuerySelections(info);
  const { page, perPage = 25 } = args;
  let ids = [];
  let result;

  ids.push(parent[name]);
  ids.unshift(selection);

  if (ids[1] === undefined || ids[1][0] === null || ids.length === 0) return [];

  try {
    result = await context.dataloader[loaderName].loadMany(ids);
    /**
     * ! ONLY FOR MySQL
     * ? "selections" will work if "sqlOptimize" is set to "selections" because of DataLoader caching second query of already used model
     * ? with same "id's" will return "null" for the new nested selections fields if wasn't selected in first selection
     * ! choose between ".clearAll()" from below or "setFields = { exclude: [""] }" in "getFunctionFromDatabase" function from "db/dbQuery/mysql" file
     */
    if (settings.database === "mysql" && settings.sqlOptimize === "selections")
      await context.dataloader[loaderName].clearAll();
  } catch (err) {
    errors_logs(err);
    error_set("nestedQueryResolvers", name + err.message);
  }

  result.shift();
  result = result[0];

  if (page !== undefined && perPage) {
    const start = (page - 1) * perPage;
    const end = page * perPage;
    if (!result[0]) return [];
    const data = result.map((i) => i);
    return data.slice(start, end);
  }

  if (types === "single" || settings.database === "mysql") return result;
  return result.map((i) => i);
};

/*******************************
 ** Main Query resolvers fields
 * @param {*} parent
 * @param {*} args
 * @param {*} context
 * @param {*} info
 * @param {*} fieldName
 * @returns Promise with all data retrived from database
 */
const queriesResolvers = async (parent, args, context, info, fieldName) => {
  let subfields = fieldName?.args;
  const { target, types } = fieldName;
  const selection = getQuerySelections(info);
  let arguments = Object.entries(args);
  let items = [];

  if (args.searchBy) {
    subfields = fieldName?.args?.searchBy?.type?._fields;
    arguments = Object.entries(args.searchBy);
  }

  try {
    if (arguments.length === 0) items = await findAllInDB(target, selection);
    else
      items = await findWithArgsInDB(target, arguments, selection, subfields);
  } catch (err) {
    errors_logs(err);
    error_set("queriesResolvers", fieldName + err.message);
  }

  const result = items.map((item) => item);
  if (types === "single") return result[0];
  if (settings.database === "mysql") return groupSQLList(items);
  return result;
};

module.exports = { queriesResolvers, nestedQueryResolvers };
