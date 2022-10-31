/******** FILE FORMAT 
1. 
********/

const { error_set } = require("../../errors/error_logs");
const { types } = require("./functionTypes");
const { Mutations } = require("../../data.json");
const { setArgsTypes } = require("../types/fieldsTypes");
const { mutation_resolver } = require("../resolvers/resolversMutations");
const {
  protectQueryAndMutations,
  protectQueryAndMutationsFields,
} = require("../../middleware/authMiddleware");

const getAllMutations = Object.entries(Mutations);
let setAllMutations = {};

for (const mutation of getAllMutations) {
  const mutationFields = mutation[1];
  let mutationName = mutation[0];

  const protect = protectQueryAndMutationsFields(mutationName);
  protect && (mutationName = protect[0]);

  setAllMutations[mutationName] = {
    type: types[`${mutationFields.target}Type`],
    args: setArgsTypes(mutationFields.args),
    async resolve(parent, args, req) {
      protectQueryAndMutations(protect, req);
      return mutation_resolver(mutationFields, parent, args, req);
    },
  };
}
// const createReviews = {
//   type: types[`${Mutations.createReviews__auth.target}Type`],
//   args: setMutationArgs(Mutations.createReviews__auth.args),
//   async resolve(parent, args) {
//     const review = new models.reviews({
//       name: args.name,
//       comment: args.comment,
//       productID: args.productID,
//       userID: "62d9d0e34e7a76dc52b53fcd",
//     });
//     let createdReview;
//     try {
//       const checks = Object.entries(Mutations.createReviews__auth.checks);

//       const result = await review.save();
//       createdReview = { ...review._doc, _id: result._doc._id.toString() };

//       //await checkID(models.users, "62d9d0e34e7a76dc52b53fcd");
//       const user = await models.users.findById("62d9d0e34e7a76dc52b53fcd");
//       if (!user) {
//         throw new Error("User not found.");
//       }

//       user.reviewsIDs.push(review);
//       await user.save();

//       //await checkID(models.products, "62d959f5a50fc038c754ce8e");
//       const product = await models.products.findById(args.productID);
//       if (!product) {
//         throw new Error("Product not found.");
//       }

//       product.reviewsIDs.push(review);
//       await product.save();
//       return createdReview;
//     } catch (err) {
//       console.log(err);
//       throw err;
//     }
//   },
// };

module.exports = { setAllMutations };
