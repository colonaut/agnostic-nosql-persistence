# agnostic-nosql-persistence

An agnostic persistence abstraction supporting adapters on NoSQL Databases.
Conception and 1st version provided, permission to open source kindly granted by [aduis]

- Context: shared package

###API
- [Model](#model)
- [Model#connect()](#model_connect)
- [Model#count()](#model_)
- [Model#insert()](#model_)
- [Model#upsert()](#model_)
- [Model#exists()](#model_)
- [Model#delete()](#model_)
- [Model#fetch()](#model_)
- [Model#find()](#model_)
- [Model#update()](#model_)
- [Model#drop()](#model_)

#####<a name="model"></a>Model(schema, index, [model_name,] options)
fgjldfjfdj
- schema: a joi schema
- index: Array of keys (string, number, array(string), array(number))
- model_name: _optional_ name of the model
- options:
    - host:
    - port:
    - db:

#####<a name="model_connect"></a>Model#connect(callback)
fldjsldfjsdlfj

#####<a name="model_"></a>Model#count(callback)
sdadsadsadsads

#####<a name="model_connect"></a>Model(schema, index [,model_name][,options])
sdadsadsadsads

#####<a name="model_connect"></a>Model#insert(data, callback)
sdadsadsadsads

#####<a name="model_connect"></a>*Model#upsert(data, callback)
sdadsadsadsads

#####<a name="model_connect"></a>*Model#exists(id, callback)
sdadsadsadsads

#####<a name="model_connect"></a>Model#delete(id, callback)
sdadsadsadsads

#####<a name="model_connect"></a>Model#fetch(id, callback)
sdadsadsadsads

#####<a name="model_connect"></a>*Model#find(query, callback)
sdadsadsadsads

#####<a name="model_connect"></a>Model#update(id, data, callback)
sdadsadsadsads

#####<a name="model_connect"></a>Model#drop(callback)


###Curently provided Adapters
- InMemory

###Planned Adapters
- (LevelDb)
- Redis
- Riak
- Couchbase
- RethinkDb
- MongoDb


###Issues
- Index on arrays exposes a joined list of arrays. Only works with string or number arrays.
- Search on an array is in conceptual phases. We might go for query for comma separated string: array property contains, query for array: array contents equal in exact order.
- query limits: not yet supported
- connection pool: not yet supported, find a suitable agnostic approach


[aduis]: https://github.com/aduis
