/******** FILE FORMAT 
1. 
********/

const {
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
} = require("graphql");
const { error_set } = require("../../errors/error_logs");
const { models } = require("../models/functionModels");
const { types } = require("../types/functionTypes");
const { Mutations } = require("../../data.json");
const { setTypes } = require("../types/fieldsTypes");
const { mutation_resolver } = require("./resolversMutations");

const getAllMutations = Object.entries(Mutations);
let setAllMutations = {};

for (const mutation of getAllMutations) {
  const mutationFields = mutation[1];
  let mutationName = mutation[0];
  let protect;

  if (mutationName.includes("__")) {
    mutationName = mutationName.split("__");
    if (
      mutationName[1].includes("auth") ||
      mutationName[1].includes("adminlevel")
    ) {
      protect = mutationName;
    }
    mutationName = mutationName[0];
  }

  setAllMutations[mutationName] = {
    type: types[`${mutationFields.target}Type`],
    args: setTypes(mutationFields.args),
    async resolve(parent, args, req) {
      if (protect && !req.isAuth) error_set("checkisAuth", req.isAuth);

      const level = req?.token?.info?.adminlevel;
      if (protect && protect[2] && level >= 0 && !(level >= protect[2]))
        error_set("checkisAdmin", protect[2]);

      return mutation_resolver(mutationFields, parent, args, req);
    },
  };
}

// const TAKE1 = Mutations.register;
// const register = {
//   type: types[`${TAKE1.target}Type`],
//   args: setMutationArgs(TAKE1.args),
//   async resolve(parent, args) {
//     return mutation_resolver(TAKE1, parent, args);
//   },
// };

// const TAKE2 = Mutations.login;
// const login = {
//   type: types[`${TAKE2.target}Type`],
//   args: setMutationArgs(TAKE2.args),
//   async resolve(parent, args) {
//     return mutation_resolver(TAKE2, parent, args);
//   },
// };

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

//       // for (const check of checks) {
//       //   const result = await models[`${check[1]}`].findOne({
//       //     [`${check[0]}`]: args[`${check[0]}`],
//       //   });
//       //   if (result) error_set("checkExisting", check);
//       // }

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
// const createCategory = {
//   type: types[`categoryType`],
//   args: {
//     name: { type: GraphQLString },
//     productsIDs: { type: GraphQLID },
//   },
//   async resolve(parent, args) {
//     const { name, productsIDs } = args;
//     const category = new models.category({
//       name,
//       productsIDs: "62d959361421cb954de3351e",
//     });
//     let createdCategory;
//     try {
//       const result = await category.save();
//       createdCategory = { ...category._doc, _id: result._doc._id.toString() };
//       const product = await models.products.findById(
//         "62d959361421cb954de3351e"
//       );
//       if (!product) {
//         throw new Error("Product not found.");
//       }
//       product.categoryIDs.push(category);
//       await product.save();
//       return createdCategory;
//     } catch (err) {
//       console.log(err);
//       throw err;
//     }
//   },
// };

// const productregister = {
//   type: types[`productsType`],
//   args: {
//     name: { type: GraphQLString },
//     categoryIDs: { type: new GraphQLList(GraphQLID) },
//     image: { type: GraphQLString },
//     price: { type: GraphQLFloat },
//     description: { type: GraphQLString },
//     countInStock: { type: GraphQLInt },
//   },
//   async resolve(parent, args, { verifiedUser }) {
//     try {
//       const product = await new models.products({
//         name: args.name,
//         categoryIDS: args.categoryIDS,
//         image: args.image,
//         price: args.price,
//         description: args.description,
//         countInStock: args.countInStock,
//       });
//       // if (verifiedUser.adminlevel === "0") {
//       //   throw new Error("Unauthorized to post a Product");
//       // }
//       const result = await product.save();
//       return JSON.stringify(result);
//     } catch (err) {
//       console.log(err);
//       throw err;
//     }
//   },
// };

module.exports = { setAllMutations };
