/************************************************************
 ** Set functions to Query Data based on database settings **
 ************************************************************/
const { settings } = require("../../settings");
const dbType = settings.database;

/*************************************************************
 ** Function used for normal field (first query) to get data
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findAllInDB = async (dbTable, dbFields) => {
  const { findAllInDB } = require(`./${dbType}`);
  return await findAllInDB(dbTable, dbFields);
};

/*********************************************************************
 ** Function used for first query to get data with arguments provided
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @param {Array} arguments Array of arguments
 * @param {Array?} order Array of multiple order
 * @returns Promise with all data retrived from database
 */
const findWithArgsInDB = async (dbTable, dbFields, arguments, order) => {
  const { findWithArgsInDB } = require(`./${dbType}`);
  return await findWithArgsInDB(dbTable, dbFields, arguments, order);
};

/******************************************************************
 ** Function used for nested query to get data with id's of parent
 * @param {String} dbTable Database table name
 * @param {Array} ids Array of ID's
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findInDB = async (dbTable, ids, dbFields) => {
  const { findInDB } = require(`./${dbType}`);
  return await findInDB(dbTable, ids, dbFields);
};

/*****************************************************************
 ** Function used to query one single element by ID / PrimaryKey
 * @param {String} dbTable Database table name
 * @param {ArrayOrString} idValue ID or Array of ID's to search for
 * @returns Promise with single data retrived from database
 */
const findIdInDB = async (dbTable, idValue) => {
  const { findIdInDB } = require(`./${dbType}`);
  return await findIdInDB(dbTable, idValue);
};

/***************************************************************
 ** Function used to query one single element with one argument
 * @param {String} dbTable Database table name
 * @param {String} dbField Database column/field name
 * @param {{}} argsValue Argument value
 * @param {ArrayOrString} encryptedFields EncriptedFields
 * @returns Promise with single data retrived from database
 */
const findOneInDB = async (dbTable, dbField, argsValue, encryptedFields) => {
  const { findOneInDB } = require(`./${dbType}`);
  return await findOneInDB(dbTable, dbField, argsValue, encryptedFields);
};

/*********************************************
 ** Function used to save object in database
 * @param {String} dbTable Database table name
 * @param {{}} argsValues Object with values to be saved
 * @returns Promise with just created data from database
 */
const saveInDB = async (dbTable, argsValues = {}) => {
  const { saveInDB } = require(`./${dbType}`);
  return await saveInDB(dbTable, argsValues);
};

/******************************************
 ** Function used to update in database
 * @param {String} dbTable Database table name
 * @param {Array} fields Array of fields
 * @param {{}} checkedResponse Object response from checks
 * @param {{}} savedObj Object already created/saved
 * @returns Promise with updated data from database
 */
const updateInDB = async (dbTable, fields, checkedObj, savedObj) => {
  const { updateInDB } = require(`./${dbType}`);
  return await updateInDB(dbTable, fields, checkedObj, savedObj);
};

module.exports = {
  saveInDB,
  updateInDB,
  findOneInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
};
