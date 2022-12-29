/*************************
 ** Mutations resolvers **
 *************************/
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jsonwebtoken");
const { encrypt } = require("../../utils/encrypt");
const { validEmail, getQuerySelections } = require("../../utils/dataFormats");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { findOneInDB, saveInDB, updateInDB, findIdInDB, findInDB, deleteInDB } = require("../../db/dbQuery");
const { settings } = require("../../settings");
const db_type = settings.database;

/************************************************************************
 ** Check every argument from mutation and assign to new object "argsObj"
 * @param {object} arguments Object with arguments
 * @param {object} args Object with arguments from Mutation
 * @param {*} req Request
 * @returns
 */
const argumentsFunction = async (arguments, args, req) => {
  const argsObj = {};
  const arg = Object.entries(arguments);
  for (const [argName, argType] of arg) {
    argsObj[argName] = { type: argType };
    if (argType.includes("email")) validEmail(args[argName]);
    if (!argType.includes("jwt") && !argType.includes("encrypt")) argsObj[argName].value = args[argName];
    if (argType.includes("encrypt")) argsObj[argName].value = await encrypt(args[argName]);
    if (argType.includes("jwt")) {
      const [jwt, field, info] = argType.split("__");
      argsObj[argName].value = req?.token?.[field];
      info && (argsObj[argName].value = req?.token?.[field][info]);
    }
  }
  return argsObj;
};

/*********************************************************************
 ** Check every field from "checksF" (checkFalse) if exist throw error
 * @param {Array} checksF "checksF" array from data provided
 * @param {object} args Arguments values provided
 */
const checkFalseFunction = async (checksF, args) => {
  let findField = {};
  let fieldError = {};
  for (const checkFalse of checksF) {
    const [[modelName, fields]] = Object.entries(checkFalse);
    for (const fieldAndProperty of fields) {
      const [field, property] = fieldAndProperty.split("__");
      let encrypted;
      fieldError = field;
      if (property) encrypted = field;
      findField = await findOneInDB(modelName, field, args[field], encrypted);
    }
  }
  findField && error_set("checkExisting_false", args[fieldError]);
};

/*************************************************************************
 ** Check every object from "checksT" (checkTrue) if not exist throw error
 * @param {Array} checksT "checksT" array from data provided
 * @param {object} argsObj Arguments values provided
 * @returns
 */
const checkTrueFunction = async (checksT, argsObj, req) => {
  let JWTFields = {};
  let result = {};

  for (const checkTrue of checksT) {
    let findField;
    let getField;
    const [tableName] = Object.keys(checkTrue);
    const [fields] = Object.values(checkTrue);
    for (const field of fields) {
      let [fieldName, encryptedType, JWT] = field.split("__");
      const argType = ["ID", "single", "list", "id"];
      getField = fieldName;
      /*** search for item, based on first value  ***/
      if (argsObj[fieldName]?.value || encryptedType === "select") {
        if (argType.some((item) => argsObj[fieldName]?.type.includes(item)))
          findField = await findIdInDB(tableName, argsObj[fields[0]].value);
        else findField = await findOneInDB(tableName, fields[0], argsObj[fields[0]].value, `_id ${fieldName}`);
        if (!findField || findField.length === 0) error_set("checkExisting_true", fieldName);
      }
      if (encryptedType) {
        if (encryptedType.includes("jwt")) {
          getField = req.token[fieldName] || req.token.info[fieldName];
          findField = await findInDB(tableName, getField, fieldName);
          !findField && error_set("checkExisting_true", fieldName);
        }
        if (encryptedType.includes("decrypt")) {
          const verified = await bcrypt.compare(argsObj[fieldName].value, findField[fieldName]);
          !verified && error_set("checkExisting_true", "Please try again");
        }
      }
      if (JWT) JWTFields[fieldName] = findField[fieldName];
    }
    if (db_type === "mysql") {
      result[tableName] = findField;
      result[getField] = findField;
    } else {
      result[tableName] = findField;
      // result[tableName] = findField?._doc;
    }
  }

  return [result, JWTFields];
};

/**************************************************
 ** Save in database every "saving" from mutations
 * @param {Array} saver Array from data provided
 * @param {object} argsObj
 * @param {PREVIOUS_RESULT} result
 * @returns
 */
const saveFunction = async (saver, argsObj, result, info) => {
  const selections = getQuerySelections(info);
  let obj = {};

  for (const save of saver) {
    const [table] = Object.keys(save);
    const [fields] = Object.values(save);
    const saveType = ["save", "update", "delete"];
    if (fields.length === 1 && saveType.some((item) => fields.includes(item))) {
      Object.keys(argsObj).forEach(function (key) {
        argsObj[key] = argsObj[key].value;
      });
      if (fields.includes("delete")) obj = await deleteInDB(table, argsObj, result);
      if (fields.includes("save")) obj = await saveInDB(table, argsObj);
    }
    if (result?.[table] || result?.[fields[0]] || result?.[fields[1]]) {
      if (fields.includes("update")) {
        Object.keys(argsObj).forEach((key) => {
          if (argsObj[key] === undefined || key === "_id") delete argsObj[key];
        });
        obj = await updateInDB(table, fields, result, argsObj, selections);
      } else {
        obj = await updateInDB(table, fields, result, obj, selections);
      }
    }
  }

  if (!obj) error_set("checkExisting_true", argsObj);
  return obj;
};

/**************************************************
 ** Return special "return" fields from mutations
 * @param {object} returns
 * @param {PREVIOUS_RESULT} result
 * @param {JsonWebToken} JWTFields
 * @returns
 */
const returnFunction = (returns, result, JWTFields) => {
  const returnedObj = new Map();
  Object.entries(returns).map(([field, value]) => {
    const [tableName, tableField, token] = value.split("__");
    if (tableName.includes("tokenExp")) returnedObj.set(field, process.env.JWT_EXPIRES);
    if (tableField) returnedObj.set(field, result[tableName][tableField]);
    if (token) {
      const token = generateToken(result[tableName][tableField], JWTFields);
      returnedObj.set(field, token);
    }
  });
  return Object.fromEntries(returnedObj);
};

module.exports = {
  argumentsFunction,
  checkFalseFunction,
  checkTrueFunction,
  saveFunction,
  returnFunction,
};
