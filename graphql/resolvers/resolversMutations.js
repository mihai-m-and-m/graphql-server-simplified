/*************************
 ** Mutations resolvers **
 *************************/
const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jsonwebtoken");
const { encrypt } = require("../../utils/encrypt");
const { validEmail } = require("../../utils/dataFormats");
const { error_set, errors_logs } = require("../../errors/error_logs");
const {
  findOneInDB,
  saveInDB,
  updateInDB,
  findIdInDB,
  findInDB,
} = require("../../db/dbQuery");
const { settings } = require("../../settings");
const db_type = settings.database;

/************************************************************************
 ** Check every argument from mutation and assign to new object "argsObj"
 * @param {Arguments} arguments
 * @param {ArgsFromMutation} args
 * @param {*} req
 * @param {*} argsObj
 * @returns
 */
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
 ** Check every field from "checksF" (checkFalse) if exist throw error
 * @param {Array} checksF
 * @param {Arguments} args
 */
const checkFalseFunction = async (checksF, args) => {
  let findField = {};
  let fieldError = {};
  for (const checkFalse of checksF) {
    const [[modelName, fields]] = Object.entries(checkFalse);
    for (const fieldAndProperty of fields) {
      const [field, property] = fieldAndProperty.split("__");
      let encrypt;
      fieldError = field;
      if (property) encrypt = field;
      findField = await findOneInDB(modelName, field, args[field], encrypt);
    }
  }
  findField && error_set("checkExisting_false", args[fieldError]);
};

/*************************************************************************
 ** Check every object from "checksT" (checkTrue) if not exist throw error
 * @param {Array} checksT
 * @param {Arguments} argsObj
 * @returns
 */
const checkTrueFunction = async (checksT, argsObj, req) => {
  let JWTFields = {};
  let result = {};
  for (const checkTrue of checksT) {
    const [tableName] = Object.keys(checkTrue);
    const [fields] = Object.values(checkTrue);

    let encryptedFields = ["_id"];
    let findField;
    let getField;

    for (const field of fields) {
      let getField = field;
      let [fieldName, encryptedType, JWT] = field.split("__");

      findField = await findOneInDB(
        tableName,
        fields[0],
        argsObj[fields[0]],
        `${fieldName} _id`
      );

      if (encryptedType) {
        if (encryptedType.includes("jwt")) {
          getField = req.token[fieldName] || req.token.info[fieldName];
          findField = await findInDB(tableName, getField, fieldName);
          !findField && error_set("checkExisting_true", fieldName);
        }

        if (encryptedType.includes("decrypt")) {
          const result = await bcrypt.compare(
            argsObj[fieldName],
            findField[fieldName]
          );
          !result && error_set("checkExisting_true", fieldName);
        }
      }

      if (JWT) JWTFields[fieldName] = findField[fieldName];

      // encryptedFields.push(fieldName);
      // getField = fieldName;
      // if (encryptedType && encryptedType.includes("id")) {
      //   findField = await findIdInDB(tableName, argsObj[fieldName]);
      //   !findField && error_set("checkExisting_true", fieldName);
      // }
    }

    /*** search for item, based on first value  ***/
    // if (!fields[0].includes("id")) {
    //   findField = await findOneInDB(
    //     tableName,
    //     fields[0],
    //     argsObj[fields[0]],
    //     encryptedFields
    //   );
    // }

    // !findField && error_set("checkExisting_true", fields[0]);

    if (db_type === "mysql") {
      result[tableName] = { ...findField };
      result[getField] = findField;
    } else result[tableName] = { ...findField._doc };

    // for (const element of fields) {
    //   const [field, encryptedType, JWT] = element.split("__");
    //   if (JWT) JWTFields[field] = findField[field];
    //   if (encryptedType && encryptedType.includes("decrypt")) {
    //     const compare = await bcrypt.compare(argsObj[field], findField[field]);
    //     !compare && error_set("checkExisting_true", field);
    //   }
    // }
  }

  return [result, JWTFields];
};

/**************************************************
 ** Save in database every "saving" from mutations
 * @param {OBJECT} saver
 * @param {OBJECT} argsObj
 * @param {PREVIOUS_RESULT} result
 * @returns
 * TODO: double check the obj and updateInDB function
 */
const saveFunction = async (saver, argsObj, result) => {
  let obj = {};
  for (const save of saver) {
    const [table] = Object.keys(save);
    const [fields] = Object.values(save);
    try {
      if (fields.length === 1 && fields.includes("save")) {
        obj = await saveInDB(table, argsObj);
      } else {
        obj = await updateInDB(table, fields, result, obj);
      }
    } catch (err) {
      error_set("checkExisting_true", fields);
    }
  }
  if (!obj) error_set("checkExisting_true", argsObj);
  return obj;
};

/**************************************************
 ** Return special "return" fields from mutations
 * @param {OBJECT} returns
 * @param {PREVIOUS_RESULT} result
 * @param {JsonWebToken} JWTFields
 * @returns
 */
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
