/******** FILE FORMAT 
1. 
********/

const DataLoader = require("dataloader");
const _ = require("lodash");
const { models, getSchemas } = require("../models/functionModels");

const data = require("../../data.json");
var fields = Object.keys(data.Schemas);

var obj_loader = {};

//console.log(fields);

const b = fields.map((schema) => {
  const a = getSchemas(schema).map((item) => {
    if (item.ref) {
      const batch = async (keys, models) => {
        //console.log(keys);
        const a = await models[item.ref].aggregate([
          {
            $unwind: "$reviews",
          },
          { $match: { reviews: "62c59d037b1b12774bdd2e5c" } },
        ]);
        //console.log(a[0].categoryIDS);
        const search2 = await models[item.ref].find({
          [item.field]: { $in: keys },
        });
        //console.log(search2[1].categoryIDS);
        const search = await models[item.ref].find({
          [item.field]: { $in: keys },
        });
        //return search;
        const gs = _.groupBy(search, item.field);
        //console.log(gs);
        return keys.map((k) => gs[k] || []);
      };
      if (item.field)
        obj_loader[item.ref + `_` + item.field + `_Loader`] = new DataLoader(
          (keys) => batch(keys, models)
        );
    }
  });
  return a;
});
//console.log(b);

// const a = getSchemas("products").map((item) => {
//   if (item.ref) {
//     const batch = async (keys, models) => {
//       const search = await models[item.ref].find({
//         [item.field]: { $in: keys },
//       });
//       const gs = _.groupBy(search, item.field);
//       return keys.map((k) => gs[k] || []);
//     };
//     if(item.field)
//     obj_loader[item.ref + `_` + item.field + `_Loader`] = new DataLoader(
//       (keys) => batch(keys, models)
//     );
//   }
// });
//console.log(obj_loader);

// const batchAll = async (keys, models) => {
//   //console.log(models);
//   const all = await models[item.ref].find({ [item.field]: { $in: keys } });

//   const gs = _.groupBy(all, item.field);

//   return keys.map((k) => gs[k] || []);
// };

// for (let i = 0; i < fields.length; i++) {
//   obj_loader[fields[i] + `Loader`] = new DataLoader((keys) =>
//     batchAll(keys, models)
//   );
// }

//console.log(obj_loader);

// const batchReviews = async (keys, { reviews }) => {
//   const allreviews = await reviews.find({ products_id: { $in: keys } });

//   const gs = _.groupBy(allreviews, "products_id");

//   return keys.map((k) => gs[k] || []);
// };

// var obj_loader = {
//   reviewsLoader: new DataLoader((keys) => batchReviews(keys, models)),
// };

module.exports = { obj_loader };
