/****************************
 ** MySQL Database queries **
 ****************************/
const { Op } = require("sequelize");
const { sequelize } = require("../mysql");
const { settings } = require("../../settings");
const { error_set } = require("../../errors/error_logs");
const { queryRelation } = require("../../graphql/models/sequelizeModels");
const { validUUIDv4 } = require("../../utils/dataFormats");

let defaultOrder = [];
settings.timeStamp && (defaultOrder = [["updatedAt", "DESC"]]);

/************************************************************
 ** Check for Associations and remove fields from selections
 * @param {ArrayOrString} dbFields
 * @param {String} dbTable Database table name
 * @returns Array of "setFields", Map of "setRelations"
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
  let result;

  /**
   * ? "selections" will work if "sqlOptimize" is set to "selections" because of DataLoader caching, second query of already used model
   * ? with same "id's" will return "null" for the new nested selections fields if wasn't selected in first selection
   * ! choose between "setFields = { exclude: [""] }" from below or the ".clearAll()" method inside "resolvers/resolversQueries" file
   */
  if (settings.sqlOptimize !== "selections") setFields = { exclude: [""] };

  if (setRelations.size === 0) {
    try {
      result = await sequelize.models[dbTable].findAll({
        where: whereValues,
        raw: true,
        order: defaultOrder,
        attributes: setFields,
      });
    } catch (err) {
      error_set("Internal database error", dbTable);
    }
    result.length === 0 && error_set("noDatainDB", dbTable);
    return result;
  }

  setRelations.forEach(({ ref, field }, { modelName, fieldName }) => {
    relations.push({
      model: sequelize.models[ref],
      as: fieldName,
      attributes: ["_id"],
    });
  });

  try {
    result = await sequelize.models[dbTable].findAll({
      where: whereValues,
      raw: true,
      include: relations,
      order: defaultOrder,
      attributes: setFields,
    });
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
  result.length === 0 && error_set("noDatainDB", dbTable);
  return result;
};

/*************************************************************
 ** Function used for normal field (first query) to get data
 * @param {String} dbTable Database table name
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 */
const findAllInDB = async (dbTable, dbFields) => {
  return await getFunctionFromDatabase(dbTable, dbFields);
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
      if (subFields[argName]?.type?.name !== "ID" && argName !== "_id") {
        argValue = { [Op.regexp]: argValue };
      } else validUUIDv4(argValue);

    return { [argName]: argValue };
  });

  return await getFunctionFromDatabase(dbTable, dbFields, values);
};

/******************************************************************
 ** Function used for nested query to get data with id's of parent
 * @param {String} dbTable Database table name
 * @param {Array} ids Array of ID's
 * @param {String} dbFields String with multiple fields separeted with space
 * @returns Promise with all data retrived from database
 * TODO: check for valid UUIDV4 and support for extra fields from mutations (JWT fields)
 */
const findInDB = async (dbTable, ids, dbFields) => {
  // const values = { _id: ids.map((i) => validUUIDv4(i)).flat() };
  const values = { _id: ids.map((i) => i).flat() };
  return await getFunctionFromDatabase(dbTable, dbFields, values);
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
    validUUIDv4(idValue);
    try {
      result = await sequelize.models[dbTable].findByPk(idValue, { raw: true });
    } catch (err) {
      error_set("Internal database error", err);
    }
    !result && error_set("notFoundInDB", idValue);
  } else {
    result = [];
    for (const id of idValue) {
      let find;
      validUUIDv4(id);
      try {
        find = await sequelize.models[dbTable].findByPk(id, { raw: true });
      } catch (err) {
        error_set("Internal database error", err);
      }
      find ? result.push(find) : error_set("notFoundInDB", idValue);
    }
  }
  return result;
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
  let result;
  let find;
  if (encryptedFields && !Array.isArray(encryptedFields))
    encryptedFields = encryptedFields.split(" ");

  if (argsValue !== undefined) find = { raw: true };
  else
    find = {
      where: { [dbField]: argsValue },
      raw: true,
      attributes: encryptedFields, // selected fields
    };

  try {
    result = await sequelize.models[dbTable].findOne(find);
  } catch (err) {
    error_set("Internal database error", err);
  }
  return result;
};

/*********************************************
 ** Function used to save object in database
 * @param {String} dbTable Database table name
 * @param {{}} argsValues Object with values to be saved
 * @returns Promise with just created data from database
 */
const saveInDB = async (dbTable, argsValues) => {
  let result;
  try {
    result = await sequelize.models[dbTable]
      .create(argsValues)
      .then((response) => response.get({ plain: true }));
  } catch (err) {
    error_set("Internal database error", err);
  }
  !result && error_set("notSavedInDB", dbTable);
  return result;
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
const updateInDB = async (dbTable, fields, checkedObj, savedObj) => {
  const [field1, field2] = fields;
  let updatedResult = [];
  let multipleInserts = [];

  if (!sequelize.isDefined(dbTable)) {
    const [tb1, tb2] = dbTable.split("_");
    dbTable = `${tb2}_${tb1}`;
  }

  if (checkedObj[field1]) {
    multipleInserts = checkedObj[field1].map((i) => {
      updatedResult.push(i._id);
      return { [field2]: savedObj._id, [field1]: i._id };
    });
    savedObj[field1] = updatedResult;
  } else if (checkedObj[field2]) {
    multipleInserts = checkedObj[field2].map((i) => {
      updatedResult.push(i._id);
      return { [field1]: savedObj._id, [field2]: i._id };
    });
    savedObj[field2] = updatedResult;
  }

  try {
    await sequelize.models[dbTable].bulkCreate(multipleInserts);
  } catch (err) {
    error_set("Internal database error", dbTable);
  }

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
