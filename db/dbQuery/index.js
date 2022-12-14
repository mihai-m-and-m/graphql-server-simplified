/************************************************************
 ** Set functions to Query Data based on database settings **
 ************************************************************/
const { settings } = require("../../settings");
const dbType = settings.database;

const {
  findOneInDB,
  saveInDB,
  updateInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
} = require(`./${dbType}`);

module.exports = {
  findOneInDB,
  saveInDB,
  updateInDB,
  findIdInDB,
  findInDB,
  findAllInDB,
  findWithArgsInDB,
};
