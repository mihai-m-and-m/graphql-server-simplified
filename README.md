# graphql-server-simplified

Get a full GraphQL API server with MongoDB database from a simple json file.

Edit the data.json file as you need to create a fully functional backend express server with MongoDB database

# Example

Define "Schemas" as an object inside data.json file from root folder
Specify the "model/table/schema" name as object key with values as an array where inside every object will represent the "field" from database/graphql
Useing "\_\_noDB" at the end of table name will not be used as field into database.
Every "field" should have a "name" and "types" keys. Also you can optionally add "required", "unique", "select", "default", "ref", "field"

Example of Schemas:
<code>
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
"auth\_\_noDB": [
{"name": "userID","types": "ID", "required": "true"},
{"name": "token", "types": "Str", "required": "true"},
{"name": "tokenExp", "types": "Str", "required": "true"}
]
}
<code>
