/***********************
 ** Queries resolvers **
 ***********************/
const { error_set, errors_logs } = require("../../errors/error_logs");
const { groupSQLList } = require("../../utils/groupResult");
const { validDBID, getQuerySelections } = require("../../utils/dataFormats");
const { findAllInDB, findWithArgsInDB } = require("../../db/dbQuery");
const { settings } = require("../../settings");
const { Op } = require("sequelize");

/***************************************************************
 ** Operations in different Databases
 * ["eq", "ne", "lt", "lte", "gt", "gte"];
 */
const operationsDB = (opName) => {
  if (settings.database === "mysql") {
    if (opName === "regex") return Op.regexp;
    return Op[opName];
  }
  if (settings.database === "mongodb") {
    return `$${opName}`;
  }
};

/********************************************************************
 ** Query resolvers for nested fields with DataLoader for perfomarce
 * @param {object} parent
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
  const { page, perPage = 25, count = false } = args;
  let ids = [];
  let result;

  ids.push(parent[name]);
  ids.unshift(selection);

  if (ids[1] === undefined || ids[1][0] === null || ids.length === 0) return [];

  try {
    result = await context.dataloader[loaderName].loadMany(ids);
  } catch (err) {
    errors_logs(err);
    error_set("nestedQueryResolvers", name + err.message);
  }

  /*************** ONLY FOR MySQL
   * ? "selections" will work if "sqlOptimize" is set to "selections" because of DataLoader caching, second query of already used model
   * ? with same "id's" will return "null" for the new nested selections fields if wasn't selected in first selection
   * ! choose between ".clearAll()" from below or "setFields = { exclude: [""] }" in "getFunctionFromDatabase" function from "db/dbQuery/mysql" file
   */
  if (settings.database === "mysql" && settings.sqlOptimize === "selections") await context.dataloader[loaderName].clearAll();

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
  const selection = getQuerySelections(info);
  const { target, types } = fieldName;
  let subfields = fieldName?.args;
  let allArguments = [];
  let items = [];
  let order = [];

  if (args) {
    const opType = ["eq", "ne", "lt", "lte", "gt", "gte"];
    const arguments = Object.entries(args);

    arguments.map(([argName, argValue]) => {
      const argsSort = Object.entries(argValue);
      if (argName === "sortBy") {
        for (let [name, value] of argsSort) {
          const keys = Object.keys(value);
          if (value.order) order.push([name, value.order]);
          if (value === "ASC" || value === "DESC") order.push([name, value]);
          opType.forEach((i) => keys.includes(i) && allArguments.push({ [name]: { [operationsDB(i)]: value[i] } }));
        }
      } else if (argName === "searchBy") {
        subfields = fieldName?.args?.searchBy?.type?._fields;
        for (let [name, value] of argsSort) {
          const keys = Object.keys(value);

          if (subfields[name]?.type?.ofType?.name === "ID" || subfields[name]?.type?.name === "ID" || name === "_id") {
            if (!Array.isArray(value)) {
              validDBID(value);
              allArguments.push({ [name]: value });
            } else
              for (const id of value) {
                validDBID(id);
                allArguments.push({ [name]: id });
              }
          } else {
            if (name === "createdAt" || name === "updatedAt") {
              !value.to && (value.to = Date.now());
              allArguments.push({ [name]: { [operationsDB("gte")]: value.from, [operationsDB("lte")]: value.to } });
            } else if (typeof value === "string") allArguments.push({ [name]: { [operationsDB("regex")]: value } });
            else allArguments.push({ [name]: value });
          }
        }
      } else {
        if (typeof argValue === "string") {
          if (argName === "_id" || subfields[argName]?.type?.name === "ID") {
            if (!Array.isArray(argValue)) {
              validDBID(argValue);
              allArguments.push({ [argName]: argValue });
            } else
              for (const id of argValue) {
                validDBID(id);
                allArguments.push({ [argName]: id });
              }
          } else argValue = { [operationsDB("regex")]: argValue };
        } else allArguments.push({ [argName]: value });
      }
    });
  }

  if (allArguments.length === 0) items = await findAllInDB(target, selection);
  else items = await findWithArgsInDB(target, selection, allArguments, order);

  items.length === 0 && error_set("noDatainDB", target);

  const result = items.map((item) => item);
  if (types === "single") return result[0];
  if (settings.database === "mysql") return groupSQLList(items);
  return result;
};

module.exports = { queriesResolvers, nestedQueryResolvers };
