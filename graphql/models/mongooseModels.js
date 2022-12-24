/***********************************************************************************
 ** Create the Models using mongoose and assign "type" and options for each field **
 ***********************************************************************************/
const mongoose = require("mongoose");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");

/*********************************************************************************
 ** Assign "type" and options for each field from each key inside "Schema" object
 * @param {Array} fieldName
 * @returns
 */
const schemaFields = (fieldName) => {
  let obj = {};
  fieldName.map((field) => {
    let name = mongoose.Schema.Types.ObjectId;
    if (field.types.includes("ID")) return;
    if (field.types.includes("Int") || field.types.includes("Float")) name = Number;
    field.types.includes("Str") && (name = String);
    field.types.includes("Boolean") && (name = Boolean);
    field.types.includes("Date") && (name = Date);

    if (field.types.includes("list")) obj[field.name] = [{ type: name }];
    else obj[field.name] = { type: name };

    field.select && (obj[field.name].select = false);
    field.required && (obj[field.name].required = true);
    field.unique && (obj[field.name].unique = true);
    field.default && (obj[field.name].default = field.default);
    field.ref && (obj[field.name].ref = field.ref);
  });
  return obj;
};

/****************************************************************
 ** Create the Models using mongoose and save it in a new object
 * @param {String} modelName
 * @param {Array} fields
 * @returns
 */
const createModel = (modelName, fields) => {
  let schemaName = `${modelName}Schema`;
  try {
    schemaName = new mongoose.Schema(schemaFields(fields), {
      timestamps: settings.timeStamp,
    });
    return mongoose.model(modelName, schemaName);
  } catch (err) {
    errors_logs(err);
    error_set("ModelSchemas", modelName + schemaName + err.message);
  }
};

let models = {};
for (let i = 0; i < getAllSchemas.length; i++) {
  const modelName = getAllSchemas[i][0];
  const schemaFields = getAllSchemas[i][1];
  if (!modelName.includes("__noDB")) models[modelName] = createModel(modelName, schemaFields);
}

module.exports = { models };
