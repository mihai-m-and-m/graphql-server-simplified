/******** FILE FORMAT 
1. Check the "Schemas" object from data.json file
2. Assign "type" and options for each field from each key inside "Schema" object
3. Create Schema for each key inside the "Schemas" object
4. Create the Models using mongoose and save it in a new object
********/

const mongoose = require("mongoose");
const { error_set } = require("../../errors/error_logs");
const { Schemas } = require("../../data.json");

//
// 1. Check the "Schemas" object from data.json file
//
const keys = Object.keys(
  Schemas ? Schemas : error_set("noSchema", "Schemas from Models")
);

const getSchemas = (item) => {
  try {
    const fields = Object.values(Schemas[item]);
    return fields;
  } catch (err) {
    error_set("noSchemaItem", err);
  }
};

//
// 2. Assign "type" and options for each field from each key inside "Schema" object
//
const schemaFields = (fieldName) => {
  try {
    const newObject = Object.assign(
      {},
      ...fieldName.map((item) => {
        if (item.types === "ID") return;
        else if (item.types === "Str") item.type = String;
        else if (item.types === "Int" || item.types === "Float")
          item.type = Number;
        else if (item.types === "Boolean") item.type = Boolean;
        else if (item.types === "Float") item.type = Number;
        else if (item.types === "Date") item.type = Date;
        else item.type = mongoose.Schema.Types.ObjectId;
        let field = {};
        if (item.types === "list") {
          field[item.name] = [{ type: item.type }];
        } else {
          field[item.name] = { type: item.type };
        }
        if (item.required) field[item.name].required = true;
        if (item.select) field[item.name].select = false;
        if (item.unique) field[item.name].unique = true;
        if (item.default) field[item.name].default = item.default;
        if (item.ref) field[item.name].ref = item.ref;
        return field;
      })
    );
    return newObject;
  } catch (err) {
    error_set("noSchemaItemFields", fieldName + err);
  }
};

//
// 3. Create Schema for each keys inside the "Schemas" object and save it in an new object
//
let allSchemas = {};
const createSchema = (schemaName, fields) => {
  const names = schemaName;
  try {
    schemaName = new mongoose.Schema(schemaFields(getSchemas(fields)), {
      timestamps: true,
    });
    allSchemas[`${names}`] = schemaName;
    return schemaName;
  } catch (err) {
    error_set("createSchema", err + names);
  }
};
const searchSchemas = () => {
  try {
    return allSchemas;
  } catch (err) {
    error_set("searchSchemas", allSchemas + err);
  }
};

//
// 4. Create the Models using mongoose and save it in a new object
//
const createModel = (modelName, schemaName) => {
  try {
    const model = mongoose.model(
      modelName,
      createSchema(schemaName, modelName)
    );
    return model;
  } catch (err) {
    error_set("searchSchemas", modelName + schemaName + err);
  }
};
let models = {};
for (let i = 0; i < keys.length; i++) {
  if (!keys[i].includes("__noDB"))
    models[keys[i]] = createModel(keys[i], keys[i] + "Schema");
}

module.exports = { models, searchSchemas, getSchemas };

/******** Create Custom Scheme in diferent file
const { schemaFields } = require("../models/functionModels");
const fieldName = [{ name: "asdf", types: "asdf" }];
console.log(schemaFields(fieldName));


const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      select: false,
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
  },
  { timestamps: true }
);

// Login
userSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// Register
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

********/
