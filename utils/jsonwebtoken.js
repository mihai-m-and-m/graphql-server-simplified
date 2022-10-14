/******** FILE FORMAT 
1. Generate jsonwebtoken
********/

const jwt = require("jsonwebtoken");

const generateToken = (id, info) => {
  return jwt.sign({ id, info }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

module.exports = { generateToken };
