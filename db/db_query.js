/******** Database queries ********/

const { settings } = require("../settings");
const { error_set } = require("../errors/error_logs");

const db_type = settings.database;

const find_all_in_database = (db_table, db_fields) => {
  // console.log(`function was called for: ${db_fields}`);
  return db_table.find().select(db_fields);
};

const find_args_database = async (db_table, args, db_fields, subfields) => {
  const values = args.map((value) => {
    if (typeof value[1] === "string") {
      if (subfields[value[0]].type.name === "ID")
        return { [value[0]]: value[1] };
      return { [value[0]]: { $regex: value[1].toString().toLowerCase() } };
    } else return { [value[0]]: value[1] };
  });

  return await db_table.find({ $and: values }).select(db_fields);
};

const find_in_database = async (db_table, id_value, db_fields) => {
  // console.log(`function was called for ${db_fields}`);
  return await db_table
    .find({
      _id: { $in: id_value },
    })
    .select(db_fields);
};

const find_by_id = async (db_table, id_value) => {
  let result;
  if (id_value.toString().match(/^[0-9a-fA-F]{24}$/))
    result = await db_table.findById(id_value);

  return result;
};

const find_one_in_database = async (
  db_table,
  db_field,
  args_value,
  encrypted_field = ""
) => {
  let result;
  !encrypted_field
    ? (result = await db_table.findOne({ [db_field]: args_value }))
    : (result = await db_table
        .findOne({ [db_field]: args_value })
        .select(encrypted_field));
  return result;
};

const save_in_database = async (db_table, args_values) => {
  let result;
  result = await new db_table(args_values.toString().toLowerCase()).save();
  return result;
};

const update_in_database = async (db_table, db_field, saved_obj, value) => {
  let result;
  result = await find_by_id(db_table, saved_obj[db_field[0]]._id);
  result[db_field[1]].push(value._id);
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
