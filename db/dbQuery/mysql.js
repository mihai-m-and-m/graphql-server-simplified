/****************************
 ** MySQL Database queries **
 ****************************/
const { Op } = require("sequelize");
const { sequelize } = require("../mysql");
const { settings } = require("../../settings");
const { error_set } = require("../../errors/error_logs");
const { queryRelation } = require("../../graphql/models/sequelizeModels");

let defaultOrder = [];
settings.timeStamp && (defaultOrder = [["updatedAt", "DESC"]]);

/************************************************************
 ** Check for Associations and remove fields from selections
 * @param {ArrayOrString} dbFields
 * @param {String} dbTable Database table name
 * @returns Array of "setFields", Map of "setRelations"
 *
 * TODO: setFields is returning good values but because of DataLoader caching second query of already used model with same id/'s will not return new nested selection fields if wasn't selected in first query
 * ! choose between "setFields = { exclude: [""] }" in "getFunctionFromDatabase" function or ".clearAll()" from resolversQueries file to clear DataLoader cache
 */
const selectedFieldsforSQL = (dbFields, dbTable) => {
  const setRelations = new Map();
  let setFields = dbFields.split(" ");

  queryRelation.forEach(({ ref, field }, { modelName, fieldName }) => {
    dbTable === modelName &&
      setFields.map((getField) => {
        if (getField === fieldName) {
          setRelations.set({ modelName, fieldName }, { ref, field });
          setFields = setFields.filter((f) => f !== fieldName);
        }
      });
  });

  if (!setFields.includes("_id")) setFields.push("_id");

  return { setFields, setRelations };
};

/******************************************
 ** Get data from database
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @param {Array?} whereValues Array of multiple objects ex: [{_id: '1'}]
 * @returns Promise with all data retrived from database
 */
const getFunctionFromDatabase = async (dbTable, dbFields, whereValues = {}) => {
  let { setFields, setRelations } = selectedFieldsforSQL(dbFields, dbTable);
  let relations = [];

  if (settings.sqlOptimize !== "selections") setFields = { exclude: [""] };

  if (setRelations.size === 0) {
    return await sequelize.models[dbTable].findAll({
      where: whereValues,
      raw: true,
      order: defaultOrder,
      attributes: setFields,
    });
  }

  setRelations.forEach(({ ref, field }, { modelName, fieldName }) => {
    relations.push({
      model: sequelize.models[ref],
      as: fieldName,
      attributes: ["_id"],
    });
  });

  return await sequelize.models[dbTable].findAll({
    where: whereValues,
    raw: true,
    include: relations,
    order: defaultOrder,
    attributes: setFields,
  });
};

/*************************************************************
 ** Function used for normal field (first query) to get data
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findAllInDB = async (dbTable, dbFields) => {
  try {
    return await getFunctionFromDatabase(dbTable, dbFields);
  } catch (err) {
    error_set("Internal database error", dbTable);
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
      !argValue.to && (argValue.to = Date.now());
      argValue = { [Op.gte]: argValue.from, [Op.lte]: argValue.to };
    }
    if (typeof argValue === "string")
      if (subFields[argName]?.type?.name !== "ID" && argName !== "_id")
        argValue = { [Op.regexp]: argValue };

    return { [argName]: argValue };
  });
  try {
    return await getFunctionFromDatabase(dbTable, dbFields, values);
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
};

/******************************************************************
 ** Function used for nested query to get data with id's of parent
 * @param {String} dbTable Database table name
 * @param {Array} ids Array of ID's
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findInDB = async (dbTable, ids, dbFields) => {
  const values = { _id: ids.map((i) => i).flat() };
  try {
    return await getFunctionFromDatabase(dbTable, dbFields, values);
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
};

/*****************************************************************
 ** Function used to query one single element by ID / PrimaryKey
 * @param {String} dbTable Database table name
 * @param {ArrayOrString} idValue ID or Array of ID's to search for
 * @returns Promise with single data retrived from database
 * TODO: check for valid UUIDV4
 */
const findIdInDB = async (dbTable, idValue) => {
  // if (idValue.toString().match(/^[0-9a-fA-F]{24}$/))
  try {
    if (!Array.isArray(idValue))
      return await sequelize.models[dbTable].findByPk(idValue, { raw: true });
    return await sequelize.models[dbTable].findAll({
      where: { _id: idValue },
      raw: true,
      order: defaultOrder,
    });
  } catch (err) {
    error_set("Internal database error", idValue);
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
  if (encryptedFields && !Array.isArray(encryptedFields))
    encryptedFields = [encryptedFields];

  try {
    if (argsValue === undefined)
      return await sequelize.models[dbTable].findOne({ raw: true });
    return await sequelize.models[dbTable].findOne({
      where: { [dbField]: argsValue },
      raw: true,
      attributes: encryptedFields, // selected fields
    });
  } catch (err) {
    error_set("Internal database error", dbField);
  }
};

/*********************************************
 ** Function used to save object in database
 * @param {String} dbTable Database table name
 * @param {{}} argsValues Object with values to be saved
 * @returns Promise with just created data from database
 */
const saveInDB = async (dbTable, argsValues) => {
  try {
    return await sequelize.models[dbTable]
      .create(argsValues)
      .then((response) => response.get({ plain: true }));
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
};

/******************************************
 ** Function used to update in database
 * @param {String} dbTable Database table name
 * @param {Array} fields Array of fields
 * @param {{}} checkedResponse Object response from checks
 * @param {{}} savedObj Object already created/saved
 * @returns Promise with updated data from database
 * TODO: updates for specific fields and values
 */
const updateInDB = async (dbTable, fields, checkedResponse, savedObj) => {
  const [field1, field2] = fields;
  let updatedResult = [];
  if (!sequelize.isDefined(dbTable)) {
    const [tb1, tb2] = dbTable.split("_");
    dbTable = `${tb2}_${tb1}`;
  }
  const multipleInserts = checkedResponse[field2].map((i) => {
    updatedResult.push(i._id);
    return { [field1]: savedObj._id, [field2]: i._id };
  });

  try {
    await sequelize.models[dbTable].bulkCreate(multipleInserts);
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
  savedObj[field2] = updatedResult;
  return savedObj;
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
