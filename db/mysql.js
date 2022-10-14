/******** FILE FORMAT 
1. 
********/

const mysql = require("mysql2");

const connectDB = async () => {
  try {
    mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log(`MySQL Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
module.exports = { connectDB };
