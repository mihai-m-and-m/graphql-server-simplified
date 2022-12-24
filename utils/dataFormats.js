/********************************************************************
 ** Validate Email address for resolvers                           **
 ** Validate ID format for MongoDB and UUIDv4 for Sequalize        **
 ** Convert date format                                            **
 ********************************************************************/
const { error_set } = require("../errors/error_logs");
const { settings } = require("../settings");

const validEmail = (email) => {
  const validEmail = /^\w+([\.-] ?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (email.match(validEmail)) return email;
  else return error_set("checkValidEmail", email);
};

const validDBID = (id) => {
  if (settings.database === "mongodb") {
    const mongodbID = /^[0-9a-fA-F]{24}$/;
    if (id.toString().match(mongodbID)) return id;
    else return error_set("checkValidID", id);
  }

  if (settings.database === "mysql") {
    const UUIDv4 = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
    if (id.toString().match(UUIDv4)) return id;
    else return error_set("checkValidID", id);
  }
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { validEmail, validDBID };
