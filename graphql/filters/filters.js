/******** FILE FORMAT 
1. 
********/

const { GraphQLInputObjectType } = require("graphql");
const { Schemas } = require("../../data.json");
const { setTypes } = require("../types/fieldsTypes");

const object = Object.entries(Schemas);

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
        if (item.select) return;
        return { [item.name]: { type: setTypes(item.types) } };
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

const createFilterInput = (schema) => {
  let schemaName = schema[0];
  const fields = schema[1];
  try {
    schemaName = new GraphQLInputObjectType({
      name: schemaName + "Search",
      fields: filterFields(fields),
      description:
        "Get specific items which includes parts of one or multiple arguments.",
    });

    return schemaName;
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const filtersObj = () => {
  try {
    let obj = {};

    for (let i = 0; i < object.length; i++) {
      if (!object[i][0].includes("__noDB"))
        obj[object[i][0] + `Search`] = createFilterInput(object[i]);
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
