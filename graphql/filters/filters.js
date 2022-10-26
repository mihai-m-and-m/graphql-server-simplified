/******** FILE FORMAT 
1. 
********/

const { GraphQLInputObjectType } = require("graphql");

const { Schemas } = require("../../data.json");
const { setTypes } = require("../types/fieldsTypes");

const keys = Object.keys(Schemas);

const filterQueryResolvers = (values, items) => {
  values.searchBy && (values = values.searchBy);
  Object.keys(values).forEach((key) => {
    items = items.filter(
      (d) =>
        d[key] &&
        d[key]
          .toString()
          .toLowerCase()
          .includes(values[key].toString().toLowerCase())
    );
  });

  return items;
};

const filterFields = (fieldName) => {
  try {
    const field = Object.values(fieldName);
    const newObject = Object.assign(
      {},
      ...field.map((item) => {
        return { [item.name]: { type: setTypes(item.types, "schema") } };
      })
    );
    return newObject;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

// const b = {
//   q: { type: GraphQLString },
//   id: { type: GraphQLString },
//   title: { type: GraphQLString },
//   views: { type: GraphQLInt },
//   views_lt: { type: GraphQLInt },
//   views_lte: { type: GraphQLInt },
//   views_gt: { type: GraphQLInt },
//   views_gte: { type: GraphQLInt },
//   user_id: { type: GraphQLString },
// };

const createFilterInput = (schemaName, filterName) => {
  try {
    schemaName = new GraphQLInputObjectType({
      name: schemaName + filterName,
      fields: filterFields(Schemas[schemaName]),
    });
    if (filterName === "Filter")
      schemaName.description =
        "Get specific items equal to one or multiple arguments. \n\n\n INFO: all fileds of type `ID` can't be used with multiple arguments";
    if (filterName === "Search")
      schemaName.description =
        "Get specific items which includes parts of one or multiple arguments.";
    return schemaName;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const filtersObj = () => {
  try {
    let obj = {};
    for (let i = 0; i < keys.length; i++) {
      //obj[keys[i] + `Filter`] = createFilterInput(keys[i], "Filter");
      obj[keys[i] + `Search`] = createFilterInput(keys[i], "Search");
    }
    return obj;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};
const filters = filtersObj();

// const setFilterType = (filterName, target) => {
//   let name;
//   if (filterName === "sortBy") name = filters[`${target}Filter`];
//   if (filterName === "searchBy") name = filters[`${target}Search`];
//   //console.log(name);
//   return name;
// };

module.exports = { filters, filterQueryResolvers, filterFields };
