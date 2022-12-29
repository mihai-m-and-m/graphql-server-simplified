/****************************
 ** MySQL Database queries **
 ****************************/
const { sequelize, queryRelation } = require("../../models/sequelizeModels");
const { settings } = require("../../settings");
const { validDBID } = require("../../utils/dataFormats");
const { error_set } = require("../../errors/error_logs");
const { groupSQLList } = require("../../utils/groupResult");
const { Op } = require("sequelize");

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
 * @param {Array?} whereValues Array of multiple objects. Example: [{_id: '1'}, {name: 'test'}]
 * @param {Array?} order Array of multiple order. Example: [["updatedAt", "DESC"], ["price", "ASC"]]
 * @returns Promise with all data retrived from database
 */
const getFunctionFromDatabase = async (dbTable, dbFields, whereValues = {}, order = []) => {
  let { setFields, setRelations } = selectedFieldsforSQL(dbFields, dbTable);
  const defaultOrder = [settings.defaultDBOrder];
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
        order: order.length > 0 ? order : defaultOrder,
        attributes: setFields,
      });
    } catch (err) {
      error_set("Internal database error", dbTable);
    }
    return result;
  }

  setRelations.forEach(({ ref, field }, { modelName, fieldName }) => {
    relations.push({ model: sequelize.models[ref], as: fieldName, attributes: ["_id"] });
  });

  try {
    result = await sequelize.models[dbTable].findAll({
      where: whereValues,
      raw: true,
      include: relations,
      order: order.length > 0 ? order : defaultOrder,
      attributes: setFields,
    });
  } catch (err) {
    error_set("Internal database error", dbTable);
  }
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
 * @param {String} dbFields String with multiple fields separeted with space
 * @param {Array} arguments Array of arguments
 * @param {Array?} order Array of multiple order
 * @returns Promise with all data retrived from database
 */
const findWithArgsInDB = async (dbTable, dbFields, arguments, order) => {
  return await getFunctionFromDatabase(dbTable, dbFields, arguments, order);
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
  // const values = { _id: ids.map((i) => validDBID(i)).flat() };
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
    validDBID(idValue);
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
      validDBID(id);
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
  if (encryptedFields && !Array.isArray(encryptedFields)) encryptedFields = encryptedFields.split(" ");
  if (argsValue === undefined) find = { raw: true };
  else find = { where: { [dbField]: argsValue }, raw: true, attributes: encryptedFields };
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
    result = await sequelize.models[dbTable].create(argsValues).then((response) => response.get({ plain: true }));
  } catch (err) {
    error_set("Internal database error", err);
  }
  !result && error_set("notSavedInDB", dbTable);
  return result;
};

/*********************************************
 ** Function used to delete object from database
 * @param {String} dbTable Database table name
 * @param {{}} argsValues Object with values to be saved
 * @param {{}} result Object with values that was deleted
 * @returns Promise with data created from database
 */
const deleteInDB = async (dbTable, argsValues, result) => {
  try {
    await sequelize.models[dbTable].destroy({ where: argsValues });
  } catch (err) {
    error_set("Internal database error", err);
  }
  return result[dbTable];
};

/******************************************
 ** Function used to update in database
 * @param {String} dbTable Database table name
 * @param {Array} fields Array of fields
 * @param {{}} checkedObj Object response from checks
 * @param {{}} savedObj Object already created/saved
 * @param {String} selections String with multiple fields separeted with space
 * @returns Promise with updated data from database
 */
const updateInDB = async (dbTable, fields, checkedObj, savedObj, selections) => {
  const [field1, field2] = fields;
  let updatedResult = [];
  let multipleInserts = [];

  if (field1.includes("update")) {
    try {
      await sequelize.models[dbTable].update(savedObj, { where: { _id: checkedObj[dbTable]._id } });
    } catch (err) {
      error_set("Internal database error", dbTable);
    }
    const result = await findWithArgsInDB(dbTable, selections, { _id: checkedObj[dbTable]._id });
    return groupSQLList(result)[0];
  }

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

  const arguments = { [Op.or]: multipleInserts };
  fields = fields.join(" ");
  const result = await findWithArgsInDB(dbTable, fields, arguments);
  if (result && result.length > 0) error_set("already exists");

  try {
    await sequelize.models[dbTable].bulkCreate(multipleInserts);
  } catch (err) {
    error_set("Internal database error", err);
  }

  return savedObj;
};

module.exports = {
  deleteInDB,
  saveInDB,
  updateInDB,
  findOneInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
};
