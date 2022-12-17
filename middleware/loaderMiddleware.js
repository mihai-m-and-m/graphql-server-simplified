/********************************************************
 ** DataLoader Middleware for batching on each request **
 ********************************************************/
const DataLoader = require("dataloader");
const { getAllSchemas } = require("../data");
const { batchIds } = require("../graphql/functions/functionDataLoader");

/***********************************************************************
 ** Make for each request one Loader to proper handle database query's
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const loaderMiddleware = (req, res, next) => {
  const obj = {};
  for (const [tableName, fields] of getAllSchemas) {
    for (let { name, types, ref, field } of fields) {
      const loaderName = `${ref}_${field}_Loader`;
      if (field && !obj[loaderName]) {
        const batch = async ([selection, ...ids]) => {
          const result = await batchIds(ids, ref, selection);
          result.unshift(selection);
          return result;
        };
        obj[loaderName] = new DataLoader(batch);
      }
    }
  }
  req.dataloader = obj;
  next();
};

module.exports = { loaderMiddleware };
