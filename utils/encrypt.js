const bcrypt = require("bcryptjs");

const encrypt = async (password) => {
  return await bcrypt.hash(password, 12);
};

module.exports = { encrypt };
