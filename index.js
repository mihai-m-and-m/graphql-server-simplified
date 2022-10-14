const dotenv = require("dotenv");
dotenv.config();

const { settings } = require("./settings");

async function database() {
  if (settings.database) {
    const { connectDB } = require("./db/" + settings.database);
    await connectDB();
  }
}

async function backend() {
  let api_server;
  if (settings.backend === "graphql") {
    api_server = require("./graphql/graphql");
  }
  if (settings.backend === "rest-api") {
    api_server = require("./rest-api/restful");
  }
}

const server = async () => {
  await backend();
  await database();
  console.log(
    `\x1b[32m%s\x1b[0m`,
    `Welcome to m&m server ~ everything working smooth`
  );
};

server();
