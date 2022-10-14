/******** FILE FORMAT 
1. TODO 
********/

const { graphqlHTTP } = require("express-graphql");
const express = require("express");
const server = express();
const cors = require("cors");

const { obj_loader } = require("./dataloader/functionDataLoader");

const { auth } = require("../middleware/authMiddleware");
const schema = require("./schemas/schema");

const PORT = process.env.SERVER_PORT || 3000;
const ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";

server.use(cors());
server.use(express.json());
server.use(auth);

server.use(
  ENDPOINT,
  graphqlHTTP({
    schema: schema,
    graphiql: true,
    //context: obj_loader,
  })
);

server.listen(PORT);
console.log(`Backend running at http://localhost:${PORT}${ENDPOINT} End-Point`);
