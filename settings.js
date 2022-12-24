/**
 *! First step is to rename .env.RENAME file to .env and to set databasse connection.
 *! Second step change the following settings as you wish.
 **/

const settings = {
  /*****************************
   *! General server settings !*
   *****************************/

  /**
   ** File location to define all Schema/Query/Mutation
   */
  data: "./data_mysql.json",

  /**
   ** Database type
   * @param mongodb
   * @param mysql
   */
  database: "mysql",

  /**
   ** Backend server type
   * @param graphql
   * TODO: @param REST API
   */
  backend: "graphql",

  /**
   ** 'createdAt' and 'updatedAt' fields
   * @param Boolean
   * ? true/false
   */
  timeStamp: true,

  /**
   ** Default Database query response order
   * @param updatedAt - First element is the field/column name (Default: "updatedAt" - only with timeStamp enabled)
   * @param DESC Second element is the order type ASC/DESC (Default: "DESC")
   */
  defaultDBOrder: ["updatedAt", "DESC"],

  /*****************************
   *! GraphQL server settings !*
   *****************************/

  /**
   ** Show GraphiQL Interface to test endpoint
   *! Recomanded to be disabled in production
   * @param Boolean
   *  true / false
   */
  graphiql: true,

  /**
   ** GraphQL Depth Limit
   * How deep you are alowed to query, number of nested fields
   * @param Integer
   */
  graphqlDepthLimit: 5,

  /********************
   *! MySQL settings !*
   ********************/

  /**
   ** MySQL database synchronize
   * @param false - disable database synchronize
   * @param `alter` - will alter all tabels and recreate them
   * @param `force` - will drop all tabels and recreate them
   * @param `tableName` - name of specific table you want to synchronize
   */
  databaseSync: false,

  /**
   ** SQL optimize
   * @param selections - get selected fields from database
   * @param caching - get all fields from database but cache it only in the same request
   */
  sqlOptimize: "selections",

  /**
   ** SQL database logging
   * @param false - disable sql logging
   * @param console.log - logging show in console
   */
  sqlLogging: console.log,
};

module.exports = { settings };
