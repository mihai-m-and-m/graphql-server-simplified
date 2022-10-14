/******** FILE FORMAT 
1. Secure API endpoint
********/

const jwt = require("jsonwebtoken");

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

module.exports = { auth };
