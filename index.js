/******** Set Connections to database and start Backend Server ********/

const dotenv = require("dotenv");
const { settings } = require("./settings");
const { error_set } = require("./errors/error_logs");
dotenv.config();

async function database() {
  try {
    if (settings.database) {
      const { connectDB } = require("./db/" + settings.database);
      await connectDB();
    }
  } catch (err) {
    error_set("", err.message);
  }
}

async function backend() {
  let api_server;
  if (settings.backend === "graphql") {
    api_server = require("./graphql/server");
  }
  if (settings.backend === "rest-api") {
    api_server = require("./rest-api/restful");
  }
}

const server = async () => {
  try {
    await backend();
    await database();
    console.log(
      `\x1b[32m%s\x1b[0m`,
      `Welcome to m&m server ~ everything working smooth`
    );
  } catch (err) {
    error_set("", err.message);
  }
};

server();
