/***********************************
 ** Group MySQL Database response **
 ***********************************/

const groupSQLList = (items) => {
  const grouped = groupBy(items, (e) => e._id);
  let result = [];

  grouped.forEach((item) => {
    let finalObject = {};
    let nestedFields;

    item.map((obj) => {
      finalObject = obj;
      const keys = Object.keys(obj);
      nestedFields = keys.filter((element) => element.includes("."));
    });

    nestedFields.map((field) => {
      const newField = field.split(".");
      // Many to Many association
      if (newField[2]) delete finalObject[field];
      else {
        const value = groupNested(item, field);
        const values = value.get(field);
        finalObject[newField[0]] = values.filter(
          (e, i) => values.indexOf(e) === i
        );
        delete finalObject[field];
      }
    });
    result.push(finalObject);
  });

  return result;
};

function groupBy(array, f) {
  const map = new Map();
  array.forEach((item) => {
    const key = f(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}

function groupNested(array, field) {
  const map = new Map();
  array.forEach((item) => {
    const collection = map.get(field);
    if (!collection) {
      map.set(field, [item[field]]);
    } else {
      collection.push(item[field]);
    }
  });
  return map;
}

module.exports = { groupSQLList };
