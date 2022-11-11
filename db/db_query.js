/******** Database queries ********/

const { settings } = require("../settings");
const { error_set } = require("../errors/error_logs");

const db_type = settings.database;

const find_all_in_database = (dbTable, dbFields) => {
  // console.log(`function was called for: ${dbFields}`);
  return dbTable.find().select(dbFields);
};

const find_args_database = async (dbTable, arguments, dbFields, subFields) => {
  const values = arguments.map(([argName, argValue]) => {
    if (argName === "createdAt" || argName === "updatedAt")
      return {
        [argName]: { $gte: argValue.from, $lte: argValue.to },
      };

    if (typeof argValue === "string")
      if (subFields[argName].type.name !== "ID")
        return {
          [argName]: { $regex: argValue, $options: "i" }, // case insensitive search
        };

    return { [argName]: argValue };
  });

  return await dbTable.find({ $and: values }).select(dbFields);
};

const find_in_database = async (dbTable, idValue, dbFields) => {
  // console.log(`function was called for ${dbFields}`);
  return await dbTable
    .find({
      _id: { $in: idValue },
    })
    .select(dbFields);
};

const find_by_id = async (dbTable, idValue) => {
  let result;
  if (idValue.toString().match(/^[0-9a-fA-F]{24}$/))
    result = await dbTable.findById(idValue);

  return result;
};

const find_one_in_database = async (
  dbTable,
  dbField,
  argsValue,
  encryptedField = ""
) => {
  let result;
  !encryptedField
    ? (result = await dbTable.findOne({ [dbField]: argsValue }))
    : (result = await dbTable
        .findOne({ [dbField]: argsValue })
        .select(encryptedField));
  return result;
};

const save_in_database = async (dbTable, argsValues) => {
  let result;
  result = await new dbTable(argsValues).save();
  return result;
};

const update_in_database = async (dbTable, dbField, savedObj, value) => {
  let result;
  result = await find_by_id(dbTable, savedObj[dbField[0]]._id);
  result[dbField[1]].push(value._id);
  await result.save();
  return result;
};

module.exports = {
  find_one_in_database,
  save_in_database,
  update_in_database,
  find_by_id,
  find_in_database,
  find_all_in_database,
  find_args_database,
};
