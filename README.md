# graphql-server-simplified

Get a full GraphQL API server with MongoDB database from a simple json file.

This server includes `express, express-graphql, graphql, mongoose, cors, dataloader, dotenv, mysql2` packages as default.

Also using `bcryptjs` to encrypt special password field (or any other field if you wish) and `jsonwebtoken` to secure protect the server.

## How to use the server

Clone ripo or download it from `https://github.com/mihai-m-and-m/backend.git` and run `npm install --legacy-peer-deps` command.

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
|---------|----------------------|
| ID      | `GraphQLID`          |
| Int	  | `GraphQLInt`         |
| Float	  | `GraphQLFloat`       |
| Boolean | `GraphQLBoolean`     |
| Str	  | `GraphQLString`      |
| list    | `GraphQLList`of ID's |
| single  | `GraphQLID`          |

| Optional fields param     |  Description					|	
|---------------------------|---------------------------------------------------|
| `required: true`	    |  make the field required (!)			|
| `unique: true`	    |  make the field unique				|
| `select: false`	    |  make the field unselectable from database	|
| `default: <any>`	    |  specify default value				|
| `ref: <schema_name>`	    |  reference another Schema name			|
| `field: <field>`	    |  specify field to be refered from "ref" schema	|

## 2nd Step - define Queries
Define "Queries" as key inside `data.json` file from root folder.

Value will be one object with keys as "Query root types"

Every key will have a value of object made of required `target`, `types` and `args` . Also you can optionally add `description`

`args` key will be an object with one or multiple valid fields from `target` key which must be a valid schema name

Also inside `args` adding `searchBy` key as `Str` will auto make a full "search type" including all fields from `target`

### Supported Queries types
| Types   | Description GraphQL Type      |		
|---------|-------------------------------|	
| list    | returns `GraphQLList`of ID's  |	
| single  | returns `GraphQLID`		  |

## 3rd Step - define Mutations
Define "Mutations" as key inside `data.json` file from root folder.

Value will be one object with keys as "Mutations root types"

Every mutation will have a `target` and `args`

Optional `checkT` and `checkF` for checks true (if exist execute) or false (if exist throw error) before execution of mutation. The format should be array of objects with table name as key and array of fields names as value

`save` or `return` keys will make the mutation resolver as required. 

### Special types for Mutations `args`
| Value   	| Description of value Type     			|		
|---------------|-------------------------------------------------------|
| `email`   	| check for valid email address format			|	
| `encrypt`	| encrypt the field with highly secure bcryptjs package |	
| `!`		| add at end of value to be required		  	|
| `jwt`		| value to be taken from `jsonwebtoken` 		|

### Special types for Mutations `checkT` 
| Value			| Description of value      			|		
|-----------------------|-----------------------------------------------|
| `__decrypt`   	| decrypt the field previous encrypted		|	
| `__select`		| select field with `select: false` in schema	|	
| `__jwt`		| compare with field in `jsonwebtoken`		|
| `<args_key>__id`	| check args field with database _id 		|

### Special types for Mutations `save` key
| Value			| Description of value      				|		
|-----------------------|-------------------------------------------------------|
| `save`   		| save into specified table inside database 		|	
| `<table>__<field>`	| update database specific table and field with id	|

### Special types for Mutations `return` keys

| Value			| Description of value      				|
|-----------------------|-------------------------------------------------------|
| `single`   		| saved object from database 				|
| `<field>: <table>`	| diferent value for "field" from "table"		|
| `__token`   		| add it at end to return the `jsonwebtoken`		|
| `tokenExp`		| token expiration date defined in .env file		|

## Info: 
Using `__noDB` at the end of table name will not be used as field into database.

Using `__auth` at the end of Query/Mutation name will require a valid token (login function)

Using `__adminlevel__1` at the end of Query/Mutation name will restrict the route to specified level or below

Timestamps will be autogenerated

#### Example of Schemas:

```json

"Schemas": {
	"users": [
		{"name": "_id","types": "ID","required": "true","unique": "true"},
		{"name": "username", "types": "Str", "required": "true" },
		{"name": "email","types": "Str","required": "true","unique": "true"},
		{"name": "password","types": "Str","required": "true", "select": "false"},
		{"name": "adminlevel","types": "Int","required": "true","default": "0", "select": "false"},
		{"name": "reviewsIDs", "types": "list", "ref": "reviews", "field": "userID"}
	],
	"products": [
		{"name": "_id", "types": "ID","required": "true","unique": "true"},
		{"name": "name", "types": "Str", "required": "true" },
		{"name": "categoryIDs", "types": "list", "ref": "category", "field": "productsIDs"},
		{"name": "price", "types": "Float", "required": "true" },
		{"name": "description","types": "Str","required": "true"},
		{"name": "countInStock","types": "Int","required": "true","default": "1"},
		{"name": "reviewsIDs", "types": "list", "ref": "reviews", "field": "productID"}
	],
	"reviews": [
		{"name": "_id","types": "ID","required": "true","unique": "true"},
		{"name": "name", "types": "Str", "required": "true"},
		{"name": "rating", "types": "Int" },
		{"name": "comment", "types": "Str", "required": "true"},
		{"name": "productID", "types": "single", "ref": "products", "field": "reviewsIDs", "required": "true"},
		{"name": "userID", "types": "single", "ref": "users", "field": "reviewsIDs", "required": "true" }
	],
	"category": [
		{"name": "_id","types": "ID","required": "true","unique": "true"},
		{"name": "name", "types": "Str", "required": "true"},
		{"name": "productsIDs", "types": "list", "ref": "products", "field": "categoryIDs"}
	],
	"auth__noDB": [
		{"name": "userID","types": "ID", "required": "true"},
		{"name": "token", "types": "Str", "required": "true"},
		{"name": "tokenExp", "types": "Str", "required": "true"}
	]
}
```

#### Example of Queries:

```json

"Queries": {
	"getUser": {
		"types": "single",
          	"description": "Get one user based on arguments",
          	"args": { "_id": "ID", "username": "Str", "email": "Str"},
          	"target": "users"
	},
	"getProducts": {
          	"types": "list",
          	"description": "Get all or a list of Products based on arguments",
          	"args": { "_id": "list", "searchBy": "Str" },
          	"target": "products"
	},
	"getOrders__auth": {
          	"types": "list",
          	"description": "Get all or a list of orders based on arguments",
		"args": { "_id": "list", "searchBy": "Str"},
        	"target": "orders"
	},
        "getReview__adminlevel__1": {
        	"types": "single",
        	"description": "Get single review",
		"args": { "_id": "ID", "searchBy": "Str" },
          	"target": "reviews"
	},
}
```

#### Example of Mutations:

```json

"Mutations": {
	"register": {
		"target": "users",
		"args": { "username": "Str!", "email": "email!", "password": "encrypt!"},
		"checksF": { "email": "users" },
		"save": { "users": ["save"] }
	},
	"login": {
		"target": "auth__noDB",
		"args": {"email": "Str!","password": "Str!"},
		"checksT": [ { "users": ["email", "password__decrypt", "adminlevel__select__jwt"] }],
		"return": { "userID": "users__id", "token": "users__id__token", "tokenExp":"tokenExp" }
		},
	"createReviews__auth": {
		"target": "reviews",
		"args": { "name": "Str!", "comment": "Str!", "productID": "ID!", "userID": "jwt__id" },
		"checksT": [ { "users": ["userID__id"] }, { "products": ["productID__id"] }  ],
		"save": { "reviews": ["save", "users__reviewsIDs", "products__reviewsIDs"] }
	},
	"createCategory__adminlevel__1": {
		"target": "category",
		"args": { "name": "Str!", "productIDs": "list"},
		"checksF": { "category": "name" },
		"save": { "category": ["save"] }
	},
	"productregister__adminlevel__3": {
		"target": "products",
		"args": {"name": "Str!","categoryIDs": "list","image": "Str","price": "Float!","description": "Str!","countInStock": "Int"},
		"checksT": [ { "users": ["id"] }, { "category": ["productID"] }  ],
		"save": { "products": ["save"] },
		"return": { "products": "single" }
	}
}
```
