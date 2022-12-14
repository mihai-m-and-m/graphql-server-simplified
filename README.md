# graphql-server-simplified

This is a work in progress any change at any time could be a braking change before the first stable release (1.0.0)

Get a full GraphQL API server with MongoDB (for now) database from a simple json file.

This server includes `express, express-graphql, graphql, mongoose, cors, dataloader, dotenv, graphql-depth-limit, sequelize, sqlite3` packages as default.

Also using `bcryptjs` to encrypt special password field (or any other field if you wish) and `jsonwebtoken` to secure protect the server.

## How to use the server

Clone repo or download it from `https://github.com/mihai-m-and-m/backend.git` and run `npm install --legacy-peer-deps` command.

Edit the `data.json` file as you need to create a fully functional backend express server with MongoDB database.

And of course rename the file `.env.RENAME` to `.env` and fill it with your own database connection.

## 1st Step - define Schema (model, table, types) with single definition

Define "Schemas" as key inside `data.json` file from root folder.

Value will be one object with keys as tables inside database

Specify the "model/table/schema" name as object key with values as an array where inside every object will represent the "field" from "database/graphql".

Every "field" should have `name` and `types` keys. Also you can optionally add `required`, `unique`, `select`, `default`, `ref`, `field`.
Because of MongoDB structure we recommand to always define first field as `_id`.

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

Define "Queries" as key inside `data.json` file from root folder.

Value will be one object with keys as "Query root types"

Every key will have a value of object made of required `target`, `types` and `arguments` . Also you can optionally add `description` or `!` at end of `target` or `types` fields for Non-Nullable list/schema

`arguments` key will be an object with one or multiple valid fields from `target` key which must be a valid schema name

Also inside `arguments` adding `searchBy` key and value will auto make a full "search type" including all fields from `target`

### Supported Queries types

| Types  | Description GraphQL Type                  |
| ------ | ----------------------------------------- |
| list   | returns `GraphQLList`of ID's              |
| single | returns `GraphQLID`                       |
| !      | add at end of single/list for NonNullable |

## 3rd Step - define Mutations

Define "Mutations" as key inside `data.json` file from root folder.

Value will be one object with keys as "Mutations root types"

Every mutation will have `target` and `arguments` keys

Optional `checkT` and `checkF` for checks true (if exist execute) or false (if exist throw error) before execution of mutation. The format should be array of objects with table name as key and array of fields names as value

`savings` or `return` keys will make the mutation resolver as required.

### Special types for Mutations `arguments`

| Value     | Description of value Type                             |
| --------- | ----------------------------------------------------- |
| `email`   | check for valid email address format                  |
| `encrypt` | encrypt the field with highly secure bcryptjs package |
| `!`       | add at end of value to be required                    |
| `jwt`     | value to be taken from `jsonwebtoken`                 |

### Special types for Mutations `checkT`

| Value                 | Description of value                        |
| --------------------- | ------------------------------------------- |
| `__decrypt`           | decrypt the field previous encrypted        |
| `__select`            | select field with `select: false` in schema |
| `__jwt`               | compare with field in `jsonwebtoken`        |
| `<arguments_key>__id` | check arguments field with database \_id    |

### Special types for Mutations `save` key

| Value              | Description of value                             |
| ------------------ | ------------------------------------------------ |
| `saving`           | save into specified table inside database        |
| `<table>__<field>` | update database specific table and field with id |

### Special types for Mutations `return` keys

| Value              | Description of value                       |
| ------------------ | ------------------------------------------ |
| `single`           | saved object from database                 |
| `<field>: <table>` | diferent value for "field" from "table"    |
| `__token`          | add it at end to return the `jsonwebtoken` |
| `tokenExp`         | token expiration date defined in .env file |

## Info:

Using `__noDB` at the end of table name will not be used as table into database.

Using `__auth` at the end of Query/Mutation name will require a valid token (login function)

Using `__adminlevel__1` at the end of Query/Mutation name will restrict the route to specified level or below

`Date` custom scalar is coming with optional `date` argument of different return formats: `LocaleDate` = 10/28/2040, `LocaleTime` = 23:58:18, `Date`= Sun Oct 28 2040, `GMT`= Sun, 28 Oct 2040 23:58:18 GMT, `ISO` = 2040-10-28T23:58:18.000Z, `DateUTC` = Sun Oct 28 2040 23:58:18 GMT+0000 (UTC), `TimeUTC` = 23:58:18 GMT+0000 (UTC).

TimeStamps (`createdAt` and `updatedAt` fields with `from` and `to` Date scalar type interval improving query filtering). Default return of TimeStamps will be in `ISO` if argument `date` is not provided.

`TimeStamps` as well as `graphiql` interface will be `enabled` by default but you can opt out to disable them from `settings.js` file. Inside you have extra options like `graphalDepthLimit` GraphQL Depth Limit (how deep you are alowed to query), choose between multiple `backend` API's and different `database` types.

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
    "getCategory": {
      "types": "list",
      "description": "Get categories of products",
      "arguments": { "_id": "ID", "searchBy": "searchBy" },
      "target": "category"
    },
    "getUser__auth": {
      "types": "single",
      "description": "Get one user based on arguments",
      "arguments": { "_id": "ID", "username": "Str", "email": "Str" },
      "target": "users"
    },
    "getUsers__adminlevel__1": {
      "types": "list!",
      "description": "Get all users if no argument or a list of users based on argument/s",
      "arguments": { "username": "Str", "searchBy": "searchBy" },
      "target": "users!"
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
      "arguments": { "_id": "list", "searchBy": "searchBy" },
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
      "types": "list",
      "description": "Get all or a list of reviews based on arguments",
      "arguments": { "_id": "list", "userID": "ID", "searchBy": "searchBy", "sortBy": "sortBy"  },
      "target": "reviews"
    }
  }
```

#### Example of Mutations:

```json

  "Mutations": {
    "register": {
      "target": "users",
      "arguments": { "username": "Str!", "email": "email!", "password": "encrypt!" },
      "checksF": [ { "users": ["email__select"] } ],
      "savings": { "users": ["save"] }
    },
    "login": {
      "target": "auth__noDB",
      "arguments": { "email": "Str!", "password": "Str!" },
      "checksT": [ { "users": ["email", "password__decrypt", "adminlevel__select__jwt"] } ],
      "returns": { "userID": "users___id", "token": "users___id__token", "tokenExp": "tokenExp" }
    },
    "createReviews__auth": {
      "target": "reviews",
      "arguments": { "name": "Str!", "comment": "Str!", "productID": "ID!",  "userID": "jwt__id" },
      "checksT": [ { "users": ["userID__id"] }, { "products": ["productID__id"] } ],
      "savings": { "reviews": ["save", "users__reviewsIDs", "products__reviewsIDs"] }
    },
    "createCategory__adminlevel__1": {
      "target": "category",
      "arguments": { "name": "Str!", "productIDs": "list" },
      "checksF": [ { "category": ["name"] } ],
      "savings": { "category": ["save"] }
    },
    "productregister__adminlevel__3": {
      "target": "products",
      "arguments": { "name": "Str!", "categoryIDs": "list", "image": "Str", "price": "Float!", "description": "Str!", "countInStock": "Int" },
      "checksT": [ { "users": ["id"] }, { "category": ["productID"] } ],
      "savings": { "products": ["save"] }
    }
  }
```
