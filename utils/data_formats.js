/******** FILE FORMAT 
1. Validate Email address for resolvers
2. Convert date format
********/

const validEmail = () => {
  const validEmail = /^\w+([\.-] ?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return validEmail;
};

const date = (param) => {
  return new Date(param).toISOString();
};

module.exports = { date, validEmail };
