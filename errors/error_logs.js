const errors_logs = (err) => {
  //console.log(err);
};

const error_set = (text, args) => {
  const color = "\x1b[31m";
  switch (text) {
    case "noSchema":
      text = 'THERE IS MISSING object with name "Schemas" from data.json ';
      break;
    case "noSchemaItem":
      text = 'THERE IS MISSING FROM "Schemas" the keys names from data.json ';
      break;
    case "noSchemaItemFields":
      text =
        'THERE IS MISSING FROM "Schemas" the values of one key names from data.json ';
      break;
    case "getAllQueries":
      text =
        'THERE IS MISSING FROM "setQueries" the keys names from data.json ';
      break;
    case "getQueriesList":
      text =
        'THERE IS MISSING FROM a field from "setQueries" the values from data.json ';
      break;
    case "checkExisting_false":
      text = "Exists already - " + args;
      break;
    case "checkExisting_true":
      text = "Invalid details - " + args;
      break;
    case "checkValidEmail":
      text = "Invalid Email format: " + args;
      break;
    case "checkisAuth":
      text = "Authenticated: " + args;
      break;
    case "checkisAdmin":
      text = "Higher admin access required: level " + args;
      break;
    default:
      text = "There was a problem, still need to implement error message";
  }
  const arrow = " ===>>>  ";
  console.log(`${color}%s\x1b[0m`, text + arrow + args);
  throw new Error(text);
};

//// TO DO:
//// setFieldsTypes, setQueriesFields, createQuerys - from functionQueries

/// objectTypes, createType  - from functionTypes

/// nestedQueryResolvers, queriesResolvers, loadersQueries  - from resolversQueries

module.exports = { error_set, errors_logs };
