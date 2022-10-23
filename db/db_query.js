/******** FILE FORMAT 
1. 
********/

const { error_set } = require("../errors/error_logs");

const find_in_database = async (db_table, id_value, db_type = "mangodb") => {
  //console.log(`function was called for: ${id_value}`);
  return await db_table
    .find({
      _id: { $in: id_value },
    })
    .limit(50);
};

const find_by_id = async (db_table, id_value, db_type = "mangodb") => {
  let result;
  if (id_value.toString().match(/^[0-9a-fA-F]{24}$/))
    result = await db_table.findById(id_value);

  return result;
};

const find_one_in_database = async (
  db_table,
  db_field,
  args_value,
  encrypted_field = "",
  db_type = "mangodb"
) => {
  let result;
  !encrypted_field
    ? (result = await db_table.findOne({ [db_field]: args_value }))
    : (result = await db_table
        .findOne({ [db_field]: args_value })
        .select(encrypted_field));
  return result;
};

const save_in_database = async (db_table, args_values, db_type = "mangodb") => {
  let result;
  result = await new db_table(args_values).save();
  return result;
};

const update_in_database = async (
  db_table,
  db_field,
  saved_obj,
  value,
  db_type = "mangodb"
) => {
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
};
