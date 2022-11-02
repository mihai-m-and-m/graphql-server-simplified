/******** Make Server running using express ********/

const { graphqlHTTP } = require("express-graphql");
const express = require("express");
const cors = require("cors");
const depthLimit = require("graphql-depth-limit");
const { obj_loader } = require("./functions/functionDataLoader");
const { auth } = require("../middleware/authMiddleware");
const { settings } = require("../settings");
const { graphQLSchema } = require("./schema");
const server = express();

const PORT = process.env.SERVER_PORT || 3000;
const ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";

server.use(cors());
server.use(express.json());
server.use(auth);
server.use(obj_loader);

server.use(
  ENDPOINT,
  graphqlHTTP({
    schema: graphQLSchema,
    graphiql: settings.graphiql,
    validationRules: [depthLimit(settings.graphqlDepthLimit)],
  })
);

server.listen(PORT);
console.log(`Backend running at http://localhost:${PORT}${ENDPOINT} End-Point`);
