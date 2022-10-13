const mongoose = require("mongoose");
const connectDB = () => {
  try {
    mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );
    console.log(`MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
module.exports = { connectDB };
