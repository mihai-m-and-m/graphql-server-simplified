/********************
 ** Error handling **
 ********************/

/******************
 ** Logging errors
 * @param {ERROR} err
 * TODO: store errors into .txt file
 */
const errors_logs = (err) => {
  //console.log(err);
};

/******************
 ** Throw Errors
 * @param {STRING} text
 * @param {ERROR} args
 * TODO: IMPROVE ERROR HANDLING
 */
const error_set = (text, args) => {
  const color = "\x1b[31m";
  switch (text) {
    case "ModelSchemas":
      text = "Invalid Models inside 'functionModels' file ";
      break;
    case "DataLoader":
      text = "Invalid DataLoader inside 'functionDataLoader' file ";
      break;
    case "Mutations":
      text = "Invalid Mutation inside 'functionMutations' file ";
      break;
    case "Queries":
      text = "Invalid Mutation inside 'functionQueries' file ";
      break;
    case "createType":
      text = "Invalid Types inside 'functionTypes' file ";
      break;
    case "resolversMutations":
      text = "Invalid Mutation inside 'resolversMutations' file ";
      break;
    case "nestedQueryResolvers":
      text = "Error for nested field in 'resolverQueries' file ";
      break;
    case "queriesResolvers":
      text = "Error for Query resolver in 'resolverQueries' file ";
      break;
    case "setFieldsTypes":
      text = "Error set arguments types in 'fieldsTypes' file ";
      break;
    case "createFilterInput":
      text = "Error creating Filter Input in 'filtersTypes' file ";
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
      text = "There was a problem: " + text;
  }
  const arrow = " ===>>>  ";
  console.log(`${color}%s\x1b[0m`, text + arrow + args);
  throw new Error(text);
};

module.exports = { error_set, errors_logs };
