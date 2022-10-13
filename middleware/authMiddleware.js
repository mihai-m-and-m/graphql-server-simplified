const jwt = require("jsonwebtoken");
//const asyncHandler = require("express-async-handler");
//const { User } = require("../graphql/models");

const auth = (req, res, next) => {
  let decodedToken;
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  if (!token || token === "" || !authHeader.startsWith("Bearer")) {
    req.isAuth = false;
    return next();
  }
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.token = decodedToken;
  next();
};

// const protect = asyncHandler(async (req, res, next, adminlevel) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1] || "";

//       const verified = jwt.verify(token, process.env.JWT_SECRET);
//       //   req.decodedUser = decoded;
//       req.verifiedUser = verified._id;
//       //console.log("Verification success!", verified);
//       //console.log(verified.id.adminlevel);
//       req.username = await User.findById(verified._id).select("-password");
//       next();
//     } catch (error) {
//       console.error(error);
//       res.status(401);
//       throw new Error("Not authorized, token failed");
//     }
//   }
//   if (!token) {
//     res.status(401);
//     throw new Error("Not authorized, no token");
//   }
// });

// const admin = (req, res, next) => {
//   console.log(req._id);
//   if (req.user && req.user.isAdmin) {
//     next();
//   } else {
//     res.status(401);
//     throw new Error("Not authorized as an Admin");
//   }
// };

module.exports = { auth };
