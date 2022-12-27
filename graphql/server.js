/***************************************
 ** Make Server running using express **
 ***************************************/
const { graphqlHTTP } = require("express-graphql");
const express = require("express");
const cors = require("cors");
const depthLimit = require("graphql-depth-limit");
const { loaderMiddleware } = require("../middleware/loaderMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { settings } = require("../settings");
const { graphQLSchema } = require("./schema");
const server = express();

const HOST = process.env.SERVER_HOST || "http://localhost";
const PORT = process.env.SERVER_PORT || 5000;
const ENDPOINT = process.env.GRAPHQL_ENDPOINT || "/graphql";

server.use(
  ENDPOINT,
  cors(),
  express.json(),
  authMiddleware,
  loaderMiddleware,
  graphqlHTTP(() => {
    let enableGraphiql = false;
    if (settings.graphiql) enableGraphiql = { headerEditorEnabled: true };
    return {
      schema: graphQLSchema,
      graphiql: enableGraphiql,
      validationRules: [depthLimit(settings.graphqlDepthLimit)],
    };
  })
);

// server.get("/dashboard", authMiddleware, (req, res) => {
//   if (req.isAuth && req.token.info.adminlevel >= 0) res.sendFile(path.join(__dirname, "../dashboard/index.html"));
//   else res.sendFile(path.join(__dirname, "../dashboard/login.html"));
// });

server.listen(PORT);
console.log(`Backend running at ${HOST}:${PORT}${ENDPOINT} End-Point`);
