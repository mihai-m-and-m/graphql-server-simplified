/******** FILE FORMAT 
1. 
********/

const bcrypt = require("bcryptjs");
const { generateToken } = require("../../utils/jsonwebtoken");
const { encrypt } = require("../../utils/encrypt");
const { date, validEmail } = require("../../utils/data_formats");
const { error_set, errors_logs } = require("../../errors/error_logs");

const { models } = require("../models/functionModels");
const {
  find_one_in_database,
  save_in_database,
  update_in_database,
  find_by_id,
} = require("../../db/db_query");

const mutation_resolver = async (mutation, parent, args, req) => {
  const checksT = mutation.checksT ? mutation.checksT : [];
  const checksF = mutation.checksF ? Object.entries(mutation.checksF) : [];
  const returns = mutation.return ? Object.entries(mutation.return) : [];
  const saver = mutation.save ? Object.entries(mutation.save) : [];
  const arguments = Object.entries(mutation.args);

  let args_obj = {};
  let returned_obj = {};
  let JWT_fields = {};
  let result = {};

  let error;
  try {
    for (const arg of arguments) {
      if (arg[1].includes("email") && !args[arg[0]].match(validEmail()))
        error_set("checkValidEmail", args[arg[0]]);
      if (arg[1].includes("encrypt"))
        args_obj[arg[0]] = await encrypt(args[arg[0]]);
      else if (arg[1].includes("jwt")) {
        const field = arg[1].split("__");
        args_obj[arg[0]] = req?.token?.[field[1]];
        if (field[2]) args_obj[arg[0]] = req?.token?.[field[1]][field[2]];
      } else args_obj[arg[0]] = args[arg[0]];
    }

    //console.time("Execution Time 'for of' function");
    for (const check of checksF) {
      let find_field;
      const encrypted_field = check[0].split("__");

      find_field = await find_one_in_database(
        models[check[1]],
        encrypted_field[0],
        args[encrypted_field[0]],
        encrypted_field[0]
      );

      if (find_field)
        error_set("checkExisting_false", args[encrypted_field[0]]);
    }
    //console.timeEnd("Execution Time 'for of' function");

    for (const check of checksT) {
      const key = Object.keys(check);
      const values = Object.values(check);
      for (const element of values[0]) {
        let find_field;
        const encrypted_field = element.split("__");
        if (element.includes("__id")) {
          find_field = await find_by_id(
            models[key],
            args_obj[encrypted_field[0]]
          );
        } else {
          find_field = await find_one_in_database(
            models[key],
            values[0][0],
            args_obj[values[0][0]],
            encrypted_field[0]
          );
        }
        result[key] = { ...find_field?._doc };

        if (encrypted_field.includes("jwt"))
          JWT_fields[encrypted_field[0]] = find_field[encrypted_field[0]];

        if (encrypted_field[1] === "decrypt") {
          find_field = await bcrypt.compare(
            args[encrypted_field[0]],
            find_field[encrypted_field[0]]
          );
        }

        if (!find_field)
          error_set(
            "checkExisting_true",
            encrypted_field ? encrypted_field[0] : element
          );
      }
    }

    for (const save of saver) {
      let saved;
      if (save[1].includes("save"))
        saved = await save_in_database(models[save[0]], args_obj);

      save[1].map(async (saving) => {
        const model = saving.split("__");

        if (model[1]) {
          saved = await update_in_database(
            models[model[0]],
            model,
            result,
            saved
          );
        }
      });

      if (!saved) error_set("checkExisting_true", args_obj);

      returned_obj = {
        ...saved._doc,
        createdAt: date(saved._doc.createdAt),
        updatedAt: date(saved._doc.updatedAt),
      };
    }
    for (const ret of returns) {
      if (ret[1].includes("__")) {
        let getTarget = ret[1].split("__");
        if (getTarget[1] === "id") getTarget[1] = "_id";
        returned_obj[ret[0]] = result[getTarget[0]][getTarget[1]];
        if (getTarget.includes("token")) {
          const token = generateToken(
            result[getTarget[0]][getTarget[1]],
            JWT_fields
          );
          returned_obj[ret[0]] = token;
        }
      }
      if (ret[1] === "tokenExp") {
        returned_obj[ret[0]] = `${process.env.JWT_EXPIRES}`;
      }
    }

    return returned_obj;
  } catch (err) {
    errors_logs(err);
    throw err;
  }
};

module.exports = { mutation_resolver };
