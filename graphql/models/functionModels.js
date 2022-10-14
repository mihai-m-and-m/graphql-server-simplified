/******** FILE FORMAT 
1. Check the "Schemas" object from data.json file
2. Assign "type" and options for each field from each key inside "Schema" object
3. Create Schema for each key inside the "Schemas" object
4. Create the Models using mongoose and save it in a new object
********/

const mongoose = require("mongoose");
const { error_set, errors_logs } = require("../../errors/error_logs");
const { Schemas } = require("../../data.json");

//
// 1. Check the "Schemas" object from data.json file
//
const keys = Object.keys(
  Schemas ? Schemas : error_set("noSchema", "Schemas for Models")
);

//
// 2. Assign "type" and options for each field from each key inside "Schema" object
//
const schemaFields = (fieldName) => {
  let obj = {};
  try {
    fieldName.map((field) => {
      let name = mongoose.Schema.Types.ObjectId;
      if (field.types.includes("ID")) return;
      if (field.types.includes("Int") || field.types.includes("Float"))
        name = Number;
      field.types.includes("Str") && (name = String);
      field.types.includes("Boolean") && (name = Boolean);
      field.types.includes("Date") && (name = Date);

      if (field.types.includes("list")) obj[field.name] = [{ type: name }];
      else obj[field.name] = { type: name };

      field.required && (obj[field.name].required = true);
      field.select && (obj[field.name].select = false);
      field.unique && (obj[field.name].unique = true);
      field.default && (obj[field.name].default = field.default);
      field.ref && (obj[field.name].ref = field.ref);
    });
    return obj;
  } catch (err) {
    errors_logs(err);
    error_set("noSchemaItemFields", fieldName + err);
    throw err;
  }
};

//
// 3. Create Schema for each keys inside the "Schemas" object and save it in an new object
//
let allSchemas = {};
const createSchema = (schemaName, field) => {
  const names = schemaName;
  try {
    schemaName = new mongoose.Schema(
      schemaFields(Object.values(Schemas[field])),
      {
        timestamps: true,
      }
    );
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

module.exports = { models, searchSchemas };

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
