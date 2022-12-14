/******************************
 ** MongoDB Database queries **
 ******************************/
const { error_set } = require("../../errors/error_logs");
const { models } = require("../../graphql/models/mongooseModels");

/*************************************************************
 ** Function used for normal field (first query) to get data
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findAllInDB = async (dbTable, dbFields) => {
  try {
    return await models[dbTable].find().select(dbFields);
  } catch (err) {
    error_set("default", dbTable);
  }
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
  const values = arguments.map(([argName, argValue]) => {
    if (argName === "createdAt" || argName === "updatedAt") {
      if (!argValue.to) argValue.to = Date.now();
      argValue = { $gte: argValue.from, $lte: argValue.to };
    }
    if (typeof argValue === "string")
      if (subFields[argName].type.name !== "ID")
        argValue = { $regex: argValue, $options: "i" }; // case insensitive search
    return { [argName]: argValue };
  });
  try {
    return await models[dbTable].find({ $and: values }).select(dbFields);
  } catch (err) {
    error_set("default", dbTable);
  }
};

/******************************************************************
 ** Function used for nested query to get data with id's of parent
 * @param {String} dbTable Database table name
 * @param {Array} ids Array of ID's
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findInDB = async (dbTable, idValue, dbFields) => {
  try {
    return await models[dbTable]
      .find({ _id: { $in: idValue } })
      .select(dbFields);
  } catch (err) {
    error_set("default", idValue);
  }
};

/*****************************************************************
 ** Function used to query one single element by ID / PrimaryKey
 * @param {String} dbTable Database table name
 * @param {ArrayOrString} idValue ID or Array of ID's to search for
 * @returns Promise with single data retrived from database
 */
const findIdInDB = async (dbTable, idValue) => {
  try {
    if (!Array.isArray(idValue))
      if (idValue.toString().match(/^[0-9a-fA-F]{24}$/))
        return await models[dbTable].findById(idValue);
    for (const id of idValue) {
      if (id.toString().match(/^[0-9a-fA-F]{24}$/))
        return await models[dbTable].findById(idValue);
    }
  } catch (err) {
    error_set("default", idValue);
  }
};

/***************************************************************
 ** Function used to query one single element with one argument
 * @param {String} dbTable Database table name
 * @param {String} dbField Database column/field name
 * @param {ArgumentValue} argsValue Argument value
 * @param {EncriptedFields} encryptedFields
 * @returns Promise with single data retrived from database
 */
const findOneInDB = async (dbTable, dbField, argsValue, encryptedFields) => {
  const find = { [dbField]: { $regex: `^${argsValue}$`, $options: "i" } }; // exact match with case insensitive search
  try {
    return await models[dbTable].findOne(find).select(encryptedFields);
  } catch (err) {
    error_set("default", dbTable);
  }
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
    error_set("default", dbTable);
  }
  return result;
};

/******************************************
 ** Function used to update in database
 * @param {String} dbTable Database table name
 * @param {Array} updateField Array of fields
 * @param {{}} updateObj Object response from checks
 * @param {{}} savedObj Object already created/saved
 * @returns Promise with updated data from database
 * TODO: updates for specific fields and values
 */
const updateInDB = async (dbTable, updateField, updateObj, savedObj) => {
  let result;
  try {
    result = await findIdInDB(dbTable, updateObj[dbTable]._id);
    result[updateField].push(savedObj._id);
    await result.save();
  } catch (err) {
    error_set("default", dbTable);
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
