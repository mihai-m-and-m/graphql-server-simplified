/*********************************************
 ** DataLoader for batching on each request **
 *********************************************/
const { findInDB } = require("../../db/dbQuery");
const { errors_logs, error_set } = require("../../errors/error_logs");
const { groupSQLList } = require("../../utils/groupResult");

/**************************************************************************************
 ** Batch all IDs and selected fields from Query and sort them after database response
 * @param {STRING} getIds
 * @param {DatabaseTable} ref
 * @param {DatabaseRelation} dbRelation
 * @returns Promise with all data retrived from database
 * TODO: getDB result it's ok but "sort" and "groupSQLList" shuffle the result ordering by "getIds"
 */
const batchIds = async (getIds, ref, selection, dbRelation) => {
  const getAllIds = [];
  const sort = {};

  for (const getId of getIds) {
    const id = getId.toString();
    !Array.isArray(getId)
      ? !getAllIds.includes(id) && getAllIds.push(id)
      : getId.map((i) => {
          const id = i.toString();
          !getAllIds.includes(id) && getAllIds.push(id);
        });
  }
  const ids = getAllIds.filter((i) => i);

  try {
    const getDB = await findInDB(ref, ids, selection, dbRelation);
    const groupedDB = groupSQLList(getDB);
    groupedDB.forEach((element) => (sort[element._id] = element));

    return getIds.map((key) => {
      if (Array.isArray(key)) return key.map((id) => sort[id]);
      return sort[key];
    });
  } catch (err) {
    errors_logs(err);
    error_set("DataLoader", ref + ids + err.message);
  }
};

module.exports = { batchIds };
