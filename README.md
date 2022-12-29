# graphql-server-simplified

This is a work in progress any change at any time could be a braking change before the first stable release (1.0.0)

Get a full GraphQL API server with `MongoDB` database OR `MySQL` database (for now) from a simple json file.

# Summary

[1 - How to use the server](https://github.com/mihai-m-and-m/backend#how-to-use-the-server)

[2 - Define Schema (model, table, types](https://github.com/mihai-m-and-m/backend#1st-step---define-schema-model-table-types-with-single-definition)

[3 - Define Queries](https://github.com/mihai-m-and-m/backend#2nd-step---define-queries)

[4 - Define Mutations](https://github.com/mihai-m-and-m/backend#3rd-step---define-mutations)

[5 - Info](https://github.com/mihai-m-and-m/backend#info)

[6 - Code examples](https://github.com/mihai-m-and-m/backend#examples)

This server includes `express, express-graphql, graphql, mongoose, cors, dataloader, dotenv, graphql-depth-limit, sequelize, sqlite3` packages as default.

Also using `bcryptjs` to encrypt special password field (or any other field if you wish) and `jsonwebtoken` to secure protect the server.

## How to use the server

Clone repo or download it from [GitHub](https://github.com/mihai-m-and-m/backend.git) and run `npm install --legacy-peer-deps` command from any terminal but with Node.js previously installed [NodeDownload](https://nodejs.org/en/download/)

Edit the `data.json` file as you need to create a fully functional backend express server with MongoDB database.
Or change inside the settings.js file `data: "./data_mysql.json"` and `database: "mysql"` and `databaseSync: "force"` to get a fully functional backend express server with MySQL database.

And of course rename the file `.env.RENAME` to `.env` and fill it with your own database connection.

## 1st Step - define Schema (model, table, types) with single definition

Define "Schemas" as key of an object inside `data.json` file from root folder.

Value will be one object with keys as tables/collections inside database

Specify the "model/table/schema" name as object key with values as an array where inside every object will represent the "field/column" from "database/graphql".

Every "field/column" should have `name` and `types` keys. Also you can optionally add `required`, `unique`, `select`, `default`, `ref`, `field`.

Because of database structure you **NEED TO** always define first field as `_id`.

### Supported Schema types

| Types   | GraphQL Type         |
| ------- | -------------------- |
| ID      | `GraphQLID`          |
| Int     | `GraphQLInt`         |
| Float   | `GraphQLFloat`       |
| Boolean | `GraphQLBoolean`     |
| Str     | `GraphQLString`      |
| list    | `GraphQLList`of ID's |
| single  | `GraphQLID`          |
| Date    | `dateScalar`         |

| Optional fields param | Description                                   |
| --------------------- | --------------------------------------------- |
| `required: true`      | make the field required (!)                   |
| `unique: true`        | make the field unique                         |
| `select: false`       | make the field unselectable from database     |
| `default: <any>`      | specify default value                         |
| `ref: <schema_name>`  | reference another Schema name                 |
| `field: <field>`      | specify field to be refered from "ref" schema |

## 2nd Step - define Queries

Define "Queries" as key of an object inside `data.json` file from root folder.

Value will be one object with keys as "Query root types"

Every key will have a value of object made of required `target`, `types` and `arguments` . Also you can optionally add `description` or `!` at end of `target` or `types` fields for Non-Nullable list/schema

`arguments` key will be an object with one or multiple valid fields/columns from `target` key which must be a valid schema name

Inside `arguments` adding `searchBy` as key and value will auto make a full "search input type" including all fields from `target`

Also inside `arguments` adding `sortBy` as key and value will auto make a full "sort input type" including all fields from `target` with all types of sorting ASC(ascending) and DESC(descending) for Strings and for Int or Float `eq: "Equal to", ne: "Not equal to", lt: "Lower than", lte: "Lower or equal than", gt: "Greater than", gte: "Greater or equal than"`

### Supported Queries types

| Types  | Description GraphQL Type                  |
| ------ | ----------------------------------------- |
| list   | returns `GraphQLList`of ID's              |
| single | returns `GraphQLID`                       |
| !      | add at end of single/list for NonNullable |

## 3rd Step - define Mutations

Define "Mutations" as key of an object inside `data.json` file from root folder.

Value will be one object with keys as "Mutations root types"

Every mutation will have `target` and `arguments` keys

Optional `checkT` and `checkF` for checks true (if exist execute) or false (if exist throw error) before execution of mutation. The format should be array of objects with table name as key and array of fields/columns names as value

`savings` has to be an array of objects with table name as key and an array of fields/columns name as value.
NOTE: Because of different structure of multiple Databases the values differ. Please check the next table for more information.

`return` key is made for different types of mutation resolver. Used mainly for `login` system without a need to store data in database. _JsonWebToken_

### Special types for Mutations `arguments`

| Value                                               | Description of value Type                             |
| --------------------------------------------------- | ----------------------------------------------------- |
| `email`                                             | check for valid email address format                  |
| `encrypt`                                           | encrypt the field with highly secure bcryptjs package |
| `!`                                                 | add at end of value to be required                    |
| `jwt`                                               | value to be taken from `jsonwebtoken`                 |
| All Schema Types (ID, INT, etc. See the rest above) |

### Special types for Mutations `checkT`

| Value             | Description of value                        |
| ----------------- | ------------------------------------------- |
| `__decrypt`       | decrypt the field previous encrypted        |
| `__select`        | select field with `select: false` in schema |
| `__jwt`           | add the field to `jsonwebtoken`             |
| `<arguments_key>` | check arguments field with database         |

### Special types for Mutations `saving` key

| Value                | Description of value                               |
| -------------------- | -------------------------------------------------- |
| `save`               | save into specified table inside database          |
| `delete`             | delete specific item from database based on \_id   |
| `update`             | update specific item inside database based on \_id |
| `<field/column>`     | update database field / column                     |
| `<field1>__<field2>` | update database fields for Many-to-Many relations  |

**INFO for MongoDB**

We need to have one object for every diferent collection/field inserts
For example to insert one product in `products` collection with a specific category that belongs to a different collection let's say `categories`. After the object "save" inside `products` we need another object with key `categories` (as the collection in database) and the coresponding field as an array.

**If we have the following schema simulating **Many to Many** relation**

```json

    "products": [
      { "name": "_id", "types": "ID"},
      { "name": "name", "types": "Str", "required": "true" },
      { "name": "categoryIDs", "types": "list", "ref": "categories", "field": "productsIDs" },
    ],
    "categories": [
      { "name": "_id", "types": "ID" },
      { "name": "name", "types": "Str", "required": "true" },
      { "name": "productsIDs", "types": "list", "ref": "products", "field": "categoryIDs" }
    ],
```

**If we want to insert into database a new product but with a specific category we need to make `saving` like this:**

Observe the new object `{ "categories": ["productsIDs"] }` represent categories collection with productsIDs the field inside. But of course we need to add the "checksT" also to make sure we verify first the "id's" from arguments.

```json

    "productRegister": {
      "target": "products",
      "arguments": { "name": "Str!", "categoryIDs": "list"},
      "checksT": [ { "categories": ["categoryIDs"] } ],
      "savings": [ { "products": ["save"] }, { "categories": ["productsIDs"] } ]
    }

```

**INFO for MySQL**

Because MySQL is a Relational Database with help of ForeignKey, the One-To-Many relation is already there. But for Many-To-Many relation we need a object with key as a name from the two tables united by `_` and as value an array with the two fields from each table. The order is not important because the server is checking for both ways. Following the above example we need to have this:

```json

   "savings": [ { "products": ["save"] }, {  "products_categories": [ "categoryIDs", "productsIDs"] } ]

```

### Special types for Mutations `return` keys

| Value              | Description of value                       |
| ------------------ | ------------------------------------------ |
| `single`           | saved object from database                 |
| `<table>: <field>` | diferent value for "field" from "table"    |
| `__token`          | add it at end to return the `JsonWebToken` |
| `tokenExp`         | token expiration date defined in .env file |

## Info:

Using `__noDB` at the end of table name will not be used as table into database.

Using `__auth` at the end of Query/Mutation name will require a valid token (authenticate function)

Using `__adminlevel__1` at the end of Query/Mutation name will restrict the route to specified level or below

`Date` custom scalar is coming with optional `date` argument of different return formats: `LocaleDate` = 10/28/2040, `LocaleTime` = 23:58:18, `Date`= Sun Oct 28 2040, `GMT`= Sun, 28 Oct 2040 23:58:18 GMT, `ISO` = 2040-10-28T23:58:18.000Z, `DateUTC` = Sun Oct 28 2040 23:58:18 GMT+0000 (UTC), `TimeUTC` = 23:58:18 GMT+0000 (UTC).

TimeStamps (`createdAt` and `updatedAt` fields with `from` and `to` Date scalar type interval improving query filtering). Default return of TimeStamps will be in `ISO` if argument `date` is not provided.

`TimeStamps` as well as `graphiql` interface will be `enabled` by default but you can opt out to disable them from `settings.js` file. Inside you have extra options like `graphalDepthLimit` GraphQL Depth Limit (how deep you are alowed to query), choose between multiple `backend` API's and different `database` types.

# Examples

#### Example of Schemas:

```json

  "Schemas": {
    "users": [
      { "name": "_id", "types": "ID", "required": "true", "unique": "true" },
      { "name": "username", "types": "Str", "required": "true" },
      { "name": "email", "types": "Str", "required": "true", "unique": "true", "select": "false" },
      { "name": "password", "types": "Str", "required": "true", "select": "false" },
      { "name": "adminlevel", "types": "Int", "required": "true", "default": "0", "select": "false" },
      { "name": "reviewsIDs", "types": "list", "ref": "reviews", "field": "userID" },
      { "name": "ordersIDs", "types": "list", "ref": "orders", "field": "userID" }
    ],
    "products": [
      { "name": "_id", "types": "ID", "required": "true", "unique": "true" },
      { "name": "name", "types": "Str", "required": "true" },
      { "name": "categoryIDs", "types": "list", "ref": "category", "field": "productsIDs" },
      { "name": "image", "types": "Str" },
      { "name": "price", "types": "Float", "required": "true" },
      { "name": "description", "types": "Str", "required": "true" },
      { "name": "countInStock", "types": "Int", "required": "true", "default": "1" },
      { "name": "productRating", "types": "Int", "default": "0" },
      { "name": "reviewsIDs", "types": "list", "ref": "reviews", "field": "productID" }
    ],
    "orders": [
      { "name": "_id", "types": "ID", "required": "true", "unique": "true" },
      { "name": "userID", "types": "single", "ref": "users", "field": "ordersIDs", "required": "true" },
      { "name": "orderItems", "types": "list", "ref": "products", "required": "true" },
      { "name": "shippingAddress", "types": "Str" }
    ],
    "reviews": [
      { "name": "_id", "types": "ID", "required": "true", "unique": "true" },
	    { "name": "name", "types": "Str", "required": "true" },
      { "name": "rating", "types": "Int", "required": "true", "default": "0"  },
      { "name": "comment", "types": "Str", "required": "true" },
      { "name": "productID", "types": "single", "ref": "products", "field": "reviewsIDs", "required": "true" },
      { "name": "userID", "types": "single", "ref": "users", "field": "reviewsIDs", "required": "true" }
    ],
    "category": [
      { "name": "_id", "types": "ID", "required": "true", "unique": "true" },
      { "name": "name", "types": "Str", "required": "true" },
      { "name": "productsIDs", "types": "list", "ref": "products", "field": "categoryIDs" }
    ],
    "auth__noDB": [
      { "name": "userID", "types": "ID", "required": "true" },
      { "name": "token", "types": "Str", "required": "true" },
      { "name": "tokenExp", "types": "Str", "required": "true" }
    ]
  }

```

#### Example of Queries:

```json

  "Queries": {
    "getCategories": {
      "types": "list",
      "description": "Get categories of products",
      "arguments": { "searchBy": "searchBy", "sortBy": "sortBy" },
      "target": "category"
    },
    "getUser__auth": {
      "types": "single",
      "description": "Get one user based on arguments",
      "arguments": { "_id": "ID", "username": "Str", "email": "Str" },
      "target": "users"
    },
    "getUsers__auth": {
      "types": "list",
      "description": "Get all users if no argument or a list of users based on argument/s",
      "arguments": { "_id": "ID", "username": "Str", "searchBy": "searchBy" },
      "target": "users"
    },
    "getProduct__auth": {
      "types": "single",
      "description": "Get one product based on arguments",
      "arguments": { "_id": "ID", "searchBy": "searchBy" },
      "target": "products"
    },
    "getProducts": {
      "types": "list",
      "description": "Get all or a list of orders based on arguments",
      "arguments": { "_id": "ID", "searchBy": "searchBy", "sortBy": "sortBy" },
      "target": "products"
    },
    "getOrder__auth": {
      "types": "single",
      "description": "Get a single order based on arguments",
      "arguments": { "_id": "ID", "searchBy": "searchBy" },
      "target": "orders"
    },
    "getOrders__auth": {
      "types": "list",
      "description": "Get all or a list of orders based on arguments",
      "arguments": { "_id": "list", "searchBy": "searchBy" },
      "target": "orders"
    },
    "getReview": {
      "types": "single",
      "description": "Get single review",
      "arguments": { "_id": "ID", "searchBy": "searchBy" },
      "target": "reviews"
    },
    "getReviews__auth": {
      "types": "list!",
      "description": "Get all or a list of reviews based on arguments",
      "arguments": { "_id": "list", "userID": "ID", "searchBy": "searchBy", "sortBy": "sortBy"  },
      "target": "reviews!"
    }
  }

```

#### Example of MongoDB Mutations:

```json

  "Mutations": {
    "deleteProduct": {
      "target": "products",
      "arguments": { "_id": "ID!" },
      "checksT": [ { "products": ["_id"] } ],
      "savings": [ { "products": ["delete"] } ]
    },
    "updateProduct__adminlevel__3": {
      "target": "products",
      "arguments": { "_id": "ID!", "name": "Str", "image": "Str", "description": "Str" },
      "checksT": [ { "products": ["_id"] } ],
      "savings": [ { "products": ["update"] } ]
    },
    "register": {
      "target": "users",
      "arguments": { "username": "Str!", "email": "email!", "password": "encrypt!" },
      "checksF": [ { "users": ["email__select"] } ],
      "savings": [ { "users": ["save"] } ]
    },
    "login": {
      "target": "auth__noDB",
      "arguments": { "email": "email!", "password": "Str!" },
      "checksT": [ { "users": ["email", "password__decrypt", "adminlevel__select__jwt"] } ],
      "returns": { "userID": "users___id", "token": "users___id__token", "tokenExp": "tokenExp" }
    },
    "createReviews__auth": {
      "target": "reviews",
      "arguments": { "name": "Str!", "comment": "Str!", "productID": "ID!", "userID": "jwt__id" },
      "checksT": [ { "users": ["userID"] }, { "products": ["productID"] } ],
	    "savings": [ { "reviews": ["save"] }, { "users": ["reviewsIDs"] }, { "products": ["reviewsIDs"] } ]
    },
    "createCategory__adminlevel__1": {
      "target": "category",
      "arguments": { "name": "Str!", "productsIDs": "list" },
      "checksF": [ { "category": ["name"] } ],
	    "checksT": [ { "products": ["productsIDs"] } ],
      "savings": [ { "category": ["save"] }, { "products": ["categoryIDs"] } ]
    },
    "productRegister__adminlevel__3": {
      "target": "products",
      "arguments": { "name": "Str!", "categoryIDs": "list", "image": "Str", "price": "Float!", "description": "Str!", "countInStock": "Int" },
      "checksT": [ { "category": ["categoryIDs"] } ],
      "savings": [ { "products": ["save"] }, { "category": ["productsIDs"] } ]
    }
  }

```

#### Example of MySQL Mutations (Only the difference):

```json

    "createReviews__auth": {
      "savings": [ { "reviews": ["save"] } ]
    },
   "createCategory__adminlevel__1": {
      "savings": [ { "category": ["save"] }, { "products_category": [ "categoryIDs", "productsIDs"] } ]
    },
    "productRegister__adminlevel__3": {
      "savings": [ { "products": ["save"] }, { "products_category": [ "categoryIDs", "productsIDs"] } ]
    }

```
