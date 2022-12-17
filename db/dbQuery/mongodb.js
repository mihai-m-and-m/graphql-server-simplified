/******************************
 ** MongoDB Database queries **
 ******************************/
const { error_set } = require("../../errors/error_logs");
const { models } = require("../../graphql/models/mongooseModels");
const { validMongoID } = require("../../utils/dataFormats");

/*************************************************************
 ** Function used for normal field (first query) to get data
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findAllInDB = async (dbTable, dbFields) => {
  let result;
  try {
    result = await models[dbTable].find().select(dbFields);
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
  if (result.length === 0) error_set("noDatainDB", dbTable);
  return result;
};

/*********************************************************************
 ** Function used for first query to get data with arguments provided
 * @param {String} dbTable Database table name
 * @param {Array} arguments Array of arguments
 * @param {String} dbFields String with multiple fields separeted with space
 * @param {*} subFields
 * @returns Promise with all data retrived from database
 */
const findWithArgsInDB = async (dbTable, arguments, dbFields, subFields) => {
  let result;
  const values = arguments.map(([argName, argValue]) => {
    if (argName === "createdAt" || argName === "updatedAt") {
      if (!argValue.to) argValue.to = Date.now();
      argValue = { $gte: argValue.from, $lte: argValue.to };
    }
    if (typeof argValue === "string") {
      if (subFields[argName].type.name !== "ID")
        argValue = { $regex: argValue, $options: "i" };
      else validMongoID(argValue);
    }
    return { [argName]: argValue };
  });

  try {
    result = await models[dbTable].find({ $and: values }).select(dbFields);
  } catch (err) {
    error_set("Internal database error", err);
  }
  result.length === 0 && error_set("noDatainDB", dbTable);
  return result;
};

/******************************************************************
 ** Function used for nested query to get data with id's of parent
 * @param {String} dbTable Database table name
 * @param {Array} ids Array of ID's
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 * TODO: test validMongoID and support for extra fields from mutations (JWT fields)
 */
const findInDB = async (dbTable, idValue, dbFields) => {
  try {
    return await models[dbTable]
      .find({ _id: { $in: idValue } })
      .select(dbFields);
  } catch (err) {
    error_set("Internal database error", idValue);
  }
};

/*****************************************************************
 ** Function used to query one single element by ID / PrimaryKey
 * @param {String} dbTable Database table name
 * @param {ArrayOrString} idValue ID or Array of ID's to search for
 * @returns Promise with single data retrived from database
 */
const findIdInDB = async (dbTable, idValue) => {
  let result;
  if (!Array.isArray(idValue)) {
    validMongoID(idValue);
    try {
      result = await models[dbTable].findById(idValue);
    } catch (err) {
      error_set("Internal database error", err);
    }
    !result && error_set("notFoundInDB", idValue);
  } else {
    result = [];
    for (const id of idValue) {
      let find;
      validMongoID(id);
      try {
        find = await models[dbTable].findById(id);
      } catch (err) {
        error_set("Internal database error", err);
      }
      find ? result.push(find) : error_set("notFoundInDB", id);
    }
  }
  return result;
};

/***************************************************************
 ** Function used to query one single element with one argument
 * @param {String} dbTable Database table name
 * @param {String} dbField Database column/field name
 * @param {String} argsValue Argument value
 * @param {String} encryptedFields Encrypted fields
 * @returns Promise with single data retrived from database
 */
const findOneInDB = async (dbTable, dbField, argsValue, encryptedFields) => {
  const find = { [dbField]: { $regex: `^${argsValue}$`, $options: "i" } }; // exact match with case insensitive search
  let result;
  try {
    result = await models[dbTable].findOne(find).select(encryptedFields);
  } catch (err) {
    error_set("Internal database error", err);
  }
  return result;
};

/*********************************************
 ** Function used to save object in database
 * @param {String} dbTable Database table name
 * @param {{}} argsValues Object with values to be saved
 * @returns Promise with data created from database
 */
const saveInDB = async (dbTable, argsValues) => {
  let result;
  try {
    result = await new models[dbTable](argsValues).save();
  } catch (err) {
    error_set("Internal database error", err);
  }
  !result && error_set("notSavedInDB", dbTable);
  return result;
};

/******************************************
 ** Function used to update in database
 * @param {String} dbTable Database table name
 * @param {Array} updateField Array of fields
 * @param {{}} resultObj Object response from checks
 * @param {{}} savedObj Object already created/saved
 * @returns Promise with updated data from database
 * TODO: updates for specific fields and values
 * TODO: validMongoID not need yet because was already been checked inside resultObj
 */
const updateInDB = async (dbTable, updateField, resultObj, savedObj) => {
  // resultObj[dbTable].forEach((id) => validMongoID(id));
  const condition = { _id: { $in: resultObj[dbTable] } };
  const update = { $push: { [updateField]: savedObj._id } };
  try {
    await models[dbTable].updateMany(condition, update);
  } catch (err) {
    error_set("Internal database error", err);
  }
  return savedObj;
};

module.exports = {
  findOneInDB,
  saveInDB,
  updateInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
};
