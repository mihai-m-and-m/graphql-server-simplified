/*******************************
 ** MYSQL DATABASE CONNECTION **
 *******************************/
const { settings } = require("../settings");
const { databaseSync } = settings;
const { sequelize } = require("../models/sequelizeModels");

/***************************
 * Database synchronization
 * @param {STRING} type
 */
const dbSync = async (type) => {
  if (type === "force" || type === "alter") {
    await sequelize.sync({ [type]: true });
    console.log("All models were synchronized successfully.");
  } else {
    await sequelize.models[type].sync({ alter: true });
    console.log(`The table ${type} was just (re)created!`);
  }
};

/****************************
 * Check Database connection
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL Connected`);
    if (databaseSync) await dbSync(databaseSync);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
