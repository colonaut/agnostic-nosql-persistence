# agnostic-nosql-persistence

An agnostic persistence abstraction supporting adapters on NoSQL Databases.
Conception and 1st version provided, permission to open source kindly granted by [aduis]

- Context: shared package

API
---
+ Model

+ Model#connect()

+ Model#count()

+ Model#insert()

+ Model#upsert()

+ Model#exists()

+ Model#delete()

+ Model#fetch()

+ Model#find()

+ Model#update()

+ Model#drop()


**Model#connect(callback)**

**Model#count(callback)**

**Model(schema, index [,model_name][,options])**

**Model#insert(data, callback)**

**Model#upsert(data, callback)**

**Model#exists(id, callback)**

**Model#delete(id, callback)**

**Model#fetch(id, callback)**

**Model#find(query, callback)**

**Model#update(id, data, callback)**

**Model#drop(calback)**


Curently provided Adapters
--------------------------
+ InMemoryAdpater


Issues
------
+ Index on arrays exposes a joined list of arrays. Only works with string or number arrays.
+ Search on an array is in conceptual phases. We might go for query for comma separated string: array property contains, query for array: array contents equal in exact order.
+ query limits: not yet supported
+ connection pool: not yet supported, find a suitable agnostic approach


[aduis]: https://github.com/aduis
