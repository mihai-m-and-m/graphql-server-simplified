/*************************
 ** Secure API endpoint **
 *************************/
const jwt = require("jsonwebtoken");
const { error_set } = require("../errors/error_logs");

/***************************************************************************************************
 ** Check protected fields and throw error in MAIN RESOLVER from "mutation" and "functionQueries"
 * @param {*} param0
 * @param {*} param1
 * @returns
 */
const protectQueryAndMutations = (
  [queryName, method, level],
  { isAuth, token }
) => {
  if (queryName && !isAuth) return error_set("checkisAuth", isAuth);
  const getLevel = token?.info?.adminlevel;

  if (queryName && method !== "auth" && getLevel >= 0 && !(getLevel >= level))
    return error_set("checkisAdmin", level);
};

/******************************************************************************************
 ** Check fields inside "mutation" and "functionQueries" when create mutations and query
 * @param {*} field
 * @returns
 */
const protectQueryAndMutationsFields = (field) => {
  if (field.includes("__")) {
    const [fieldName, method, level] = field.split("__");
    if (method.includes("auth") || method.includes("adminlevel"))
      return [fieldName, method, level];
  }
};

/**********************************************************************
 ** Create for each request a header with "isAuth" and "token" fields
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const authMiddleware = (req, res, next) => {
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
  authMiddleware,
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
};
