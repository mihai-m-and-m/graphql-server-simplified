/************************************************************************************
 ** Create the Models using sequalize and assign "type" and options for each field **
 ************************************************************************************/
const { DataTypes } = require("sequelize");
const { getAllSchemas } = require("../../data");
const { settings } = require("../../settings");
const { sequelize } = require("../../db/mysql");
const { error_set, errors_logs } = require("../../errors/error_logs");

/*********************************************************************************
 ** Assign "type" and options for each field from each key inside "Schema" object
 * @param {Array} fieldName Column name
 * @param {*} obj
 * @returns Object for each field with specific options
 * TODO: "select" option for each field
 * TODO: new settings to choose between INTEGER ID, UUID and UUIDv4
 */
const setSchemaFields = (fieldName, obj = {}) => {
  fieldName.map((getField) => {
    const { name, types, select, required, unique } = getField;
    let type;

    if (types.includes("list") || types.includes("single")) return;

    types.includes("Int") && (type = DataTypes.INTEGER);
    types.includes("Float") && (type = DataTypes.FLOAT);
    types.includes("Boolean") && (type = DataTypes.BOOLEAN);
    types.includes("Date") && (type = DataTypes.DATE);
    types.includes("Str") && (type = DataTypes.STRING);
    types.includes("ID") && (type = DataTypes.UUID);

    obj[name] = { type };

    if (types.includes("ID")) {
      obj[name].primaryKey = true;
      obj[name].defaultValue = DataTypes.UUIDV4;
      // obj[name].autoIncrement = true;
    }

    // select && (obj[name].select = false);
    required && (obj[name].allowNull = false);
    unique && (obj[name].unique = true);
    getField.default && (obj[name].defaultValue = getField.default);
  });

  return obj;
};

/*****************************************************************
 ** Create the Models using sequelize and save it in a new object
 * @param {String} modelName Table name
 * @param {Array} fields Column name
 * @returns Models for sequalize to use communicating with database
 */
const createModel = (modelName, fields) => {
  let schemaName = `${modelName}`;
  try {
    schemaName = sequelize.define(modelName, setSchemaFields(fields), {
      freezeTableName: true,
      timestamps: settings.timeStamp,
    });
    return schemaName;
  } catch (err) {
    errors_logs(err);
    error_set("ModelSchemas", modelName + err.message);
  }
};

/**********************************
 ** Create the Models Associations
 * @param {String} modelName Table name
 * @param {Array} fields Column name
 * TODO: choose diferent type of relations for "onDelete"
 */
const createRelations = (modelName, fields) => {
  const allSchema = Object.fromEntries(getAllSchemas);

  fields.map(({ name, types, ref, field }) => {
    if (types === "list") {
      queryRelation.set({ modelName, fieldName: name }, { ref, field });

      allSchema[ref].map((refModel) => {
        const { name: refName, types: refType, field: refField } = refModel;
        if (refName === field) {
          if (refType === "single") {
            sequelize.models[modelName].hasMany(sequelize.models[ref], {
              foreignKey: field,
              as: refField,
              // onDelete: "CASCADE",
            });
            sequelize.models[ref].belongsTo(sequelize.models[modelName], {
              foreignKey: { name: field, allowNull: false },
            });
          }
          if (refType === "list" && !sequelize.models[`${ref}_${modelName}`]) {
            let relationName = `${modelName}_${ref}`;

            //* Define new Database Table for Many-to-Many relations
            sequelize.define(
              relationName,
              {
                _id: {
                  type: DataTypes.INTEGER,
                  primaryKey: true,
                  autoIncrement: true,
                  allowNull: false,
                },
              },
              { freezeTableName: true, timestamps: false }
            );

            sequelize.models[modelName].belongsToMany(sequelize.models[ref], {
              as: refField,
              through: relationName,
              foreignKey: refName,
              otherKey: refField,
            });
            sequelize.models[ref].belongsToMany(sequelize.models[modelName], {
              as: refName,
              through: relationName,
              foreignKey: refField,
              otherKey: refName,
            });

            sequelize.models[modelName].hasMany(
              sequelize.models[relationName],
              { foreignKey: refName, as: refName }
            );
            sequelize.models[ref].hasMany(sequelize.models[relationName], {
              foreignKey: refField,
              as: refField,
            });
            sequelize.models[relationName].belongsTo(
              sequelize.models[modelName],
              { foreignKey: { name: refName } }
            );
            sequelize.models[relationName].belongsTo(sequelize.models[ref], {
              foreignKey: { name: refField },
            });
          }
        }
      });
    }
    if (types.includes("single")) {
      allSchema[ref].map((refModel) => {
        const { name: refName, types: refType, field: refField } = refModel;

        if (refName === field) {
          if (refType === "single") {
            queryRelation.forEach((value, key) => {
              if (key.modelName !== modelName && key.fieldName !== name) {
                queryRelation.set(
                  { modelName, fieldName: name },
                  { ref, field }
                );

                sequelize.models[ref].hasOne(sequelize.models[modelName], {
                  foreignKey: name,
                });
                sequelize.models[modelName].belongsTo(sequelize.models[ref]);
              }
            });
          }
        }
      });
    }
  });
};

/***********************************
 ** Create the Models for sequelize
 */
for (let i = 0; i < getAllSchemas.length; i++) {
  const [modelName, schemaFields] = getAllSchemas[i];
  if (!modelName.includes("__noDB")) createModel(modelName, schemaFields);
}

/***************************************************
 ** Create the Associations for each Model
 */
const queryRelation = new Map();
for (let i = 0; i < getAllSchemas.length; i++) {
  const [modelName, schemaFields] = getAllSchemas[i];
  if (!modelName.includes("__noDB")) createRelations(modelName, schemaFields);
}

module.exports = { queryRelation };
