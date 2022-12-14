/*******************************
 ** MYSQL DATABASE CONNECTION **
 *******************************/
const { Sequelize } = require("sequelize");
const { settings } = require("../settings");
const { database, sqlLogging, databaseSync } = settings;

const sequelize = new Sequelize(
  process.env.DB_NAME || "database",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "root",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: database,
    logging: sqlLogging,
  }
);

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

module.exports = { connectDB, sequelize };
