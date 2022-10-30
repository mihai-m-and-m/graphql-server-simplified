/********  Secure API endpoint  ********/

const jwt = require("jsonwebtoken");
const { error_set } = require("../errors/error_logs");

/*********************************************************************************************
 Check protected fields and throw error in MAIN RESOLVER from "mutation" and "functionQueries"
**********************************************************************************************/
const protectQueryAndMutations = (protect, context) => {
  if (protect && !context.isAuth)
    return error_set("checkisAuth", context.isAuth);
  const level = context?.token?.info?.adminlevel;
  if (protect && protect[2] && level >= 0 && !(level >= protect[2]))
    return error_set("checkisAdmin", protect[2]);
};

/**************************************************************************************
 Check fields inside "mutation" and "functionQueries" when create mutations and query
**************************************************************************************/
const protectQueryAndMutationsFields = (field) => {
  if (field.includes("__")) {
    field = field.split("__");
    if (field[1].includes("auth") || field[1].includes("adminlevel"))
      return field;
  }
};

/******************************************************************
 Create for each request a header with "isAuth" and "token" fields
******************************************************************/
const auth = (req, res, next) => {
  let decodedToken;
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "" || !authHeader.startsWith("Bearer")) {
    req.isAuth = false;
    return next();
  }
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.token = decodedToken;
  next();
};

module.exports = {
  auth,
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
};
