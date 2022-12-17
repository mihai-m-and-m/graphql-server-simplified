/************************************************************
 ** Set functions to Query Data based on database settings **
 ************************************************************/
const { settings } = require("../../settings");
const dbType = settings.database;

const {
  saveInDB,
  updateInDB,
  findOneInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
} = require(`./${dbType}`);

module.exports = {
  saveInDB,
  updateInDB,
  findOneInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
};
