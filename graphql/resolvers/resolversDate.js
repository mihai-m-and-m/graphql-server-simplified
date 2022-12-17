/************************************************
 ** Define the resolver for "Date" type Fields **
 * @param {Int} value Date value from database
 * @param {Int} dateFormat Database table name
 * @returns Array of "setFields", Map of "setRelations"
 */
const resolverDateFormat = (value, dateFormat = 4) => {
  if (!value) return;
  if (dateFormat === 0) return value.toLocaleDateString();
  if (dateFormat === 1) return value.toLocaleTimeString();
  if (dateFormat === 2) return value.toDateString();
  if (dateFormat === 3) return value.toUTCString();
  if (dateFormat === 4) return value.toISOString();
  if (dateFormat === 5) return value.toString();
  if (dateFormat === 6) return value.toTimeString();
};

module.exports = { resolverDateFormat };
