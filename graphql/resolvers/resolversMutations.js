/******** Mutations resolvers ********/
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jsonwebtoken");
const { encrypt } = require("../../utils/encrypt");
const { validEmail } = require("../../utils/data_formats");
const { error_set, errors_logs } = require("../../errors/error_logs");

const { models } = require("../functions/functionModels");
const {
  find_one_in_database,
  save_in_database,
  update_in_database,
  find_by_id,
} = require("../../db/db_query");

/*********************************************************************
Check every argument from mutation and assign to new object "argsObj"
*********************************************************************/
const argumentsFunction = async (arguments, args, req, argsObj = {}) => {
  const arg = Object.entries(arguments);
  for (const [argName, argType] of arg) {
    if (argType.includes("email") && !args[argName].match(validEmail()))
      error_set("checkValidEmail", args[argName]);

    if (!argType.includes("jwt") && !argType.includes("encrypt"))
      argsObj[argName] = args[argName];

    if (argType.includes("encrypt"))
      argsObj[argName] = await encrypt(args[argName]);

    if (argType.includes("jwt")) {
      const [jwt, field, info] = argType.split("__");
      argsObj[argName] = req?.token?.[field];
      info && (argsObj[argName] = req?.token?.[field][info]);
    }
  }
  return argsObj;
};

/*********************************************************************
Check every field from "checksF" (checkFalse) if exist throw error
*********************************************************************/
const checkFalseFunction = async (checksF, args, findField, fieldError) => {
  for (const checkFalse of checksF) {
    const [[modelName, fields]] = Object.entries(checkFalse);
    for (const fieldAndProperty of fields) {
      const [field, property] = fieldAndProperty.split("__");
      let encryptedField;
      fieldError = field;
      if (property) encryptedField = field;

      findField = await find_one_in_database(
        models[modelName],
        field,
        args[field],
        encryptedField
      );
    }
  }
  findField && error_set("checkExisting_false", args[fieldError]);
};

/*********************************************************************
Check every object from "checksT" (checkTrue) if not exist throw error
*********************************************************************/
const checkTrueFunction = async (checksT, argsObj, result = {}) => {
  let JWTFields = {};
  for (const checkTrue of checksT) {
    const [[tableName, values]] = Object.entries(checkTrue);
    let encryptedFields = [];
    let findField;

    for (const element of values) {
      const [field, encryptedType, JWT] = element.split("__");
      encryptedFields.push(field);
      if (encryptedType && encryptedType.includes("id")) {
        findField = await find_by_id(models[tableName], argsObj[field]);
        !findField && error_set("checkExisting_true", field);
      }
    }
    /*** search for item, based on first value  ***/
    if (!values[0].includes("id")) {
      findField = await find_one_in_database(
        models[tableName],
        values[0],
        argsObj[values[0]],
        encryptedFields
      );
    }

    !findField && error_set("checkExisting_true", values[0]);
    result[tableName] = { ...findField._doc };

    for (const element of values) {
      const [field, encryptedType, JWT] = element.split("__");
      if (JWT) JWTFields[field] = findField[field];
      if (encryptedType && encryptedType.includes("decrypt")) {
        const compare = await bcrypt.compare(argsObj[field], findField[field]);
        !compare && error_set("checkExisting_true", field);
      }
    }
  }

  return [result, JWTFields];
};

/*********************************************
Save in database every "saving" from mutations
**********************************************/
const saveFunction = async (saver, argsObj, result, obj = {}) => {
  const saverMap = new Map(Object.entries(saver));
  for (const [tableName, save] of saverMap) {
    if (save.includes("save"))
      obj = await save_in_database(models[tableName], argsObj);
    if (obj)
      save.map(async (saving) => {
        const [tableName, field] = saving.split("__");
        if (field)
          obj = await update_in_database(
            models[tableName],
            tableName,
            field,
            result,
            obj
          );
      });
    if (!obj) error_set("checkExisting_true", argsObj);
    return obj;
  }
};

/*********************************************
Return special "return" fields from mutations
**********************************************/
const returnFunction = (returns, result, JWTFields) => {
  const returnedObj = new Map();
  Object.entries(returns).map(([field, value]) => {
    const [tableName, tableField, token] = value.split("__");
    if (tableName.includes("tokenExp"))
      returnedObj.set(field, process.env.JWT_EXPIRES);
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
