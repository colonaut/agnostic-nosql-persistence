## Classes

<dl>
<dt><a href="#Model">Model</a></dt>
<dd></dd>
<dt><a href="#Query">Query</a></dt>
<dd></dd>
</dl>

<a name="Model"></a>

## Model
**Kind**: global class  

* [Model](#Model)
    * [new Model(schema, index, [model_name], options)](#new_Model_new)
    * [.getIndexId(data)](#Model+getIndexId) ⇒ <code>string</code>
    * [.validate(data, callback)](#Model+validate)
    * [.connect(callback)](#Model+connect)
    * [.exists(id, callback)](#Model+exists)
    * [.insert(data, callback)](#Model+insert)
    * [.count(callback)](#Model+count)
    * [.update(id, data, callback)](#Model+update)
    * [.upsert(data, callback)](#Model+upsert)
    * [.seed(data_array, callback)](#Model+seed)
    * [.delete(id, callback)](#Model+delete)
    * [.fetch(data, callback)](#Model+fetch)
    * [.find(query, callback)](#Model+find)
    * [.drop([recreate], callback)](#Model+drop)

<a name="new_Model_new"></a>

### new Model(schema, index, [model_name], options)

| Param | Type | Description |
| --- | --- | --- |
| schema |  |  |
| index |  |  |
| [model_name] |  |  |
| options | <code>object</code> | Options |
| options.adapter | <code>string</code> &#124; <code>function</code> |  |
| options.db | <code>string</code> |  |
| options.host | <code>string</code> |  |
| options.port | <code>number</code> |  |

<a name="Model+getIndexId"></a>

### model.getIndexId(data) ⇒ <code>string</code>
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 

<a name="Model+validate"></a>

### model.validate(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+connect"></a>

### model.connect(callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| callback | 

<a name="Model+exists"></a>

### model.exists(id, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| id | 
| callback | 

<a name="Model+insert"></a>

### model.insert(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+count"></a>

### model.count(callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| callback | 

<a name="Model+update"></a>

### model.update(id, data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| id | 
| data | 
| callback | 

<a name="Model+upsert"></a>

### model.upsert(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+seed"></a>

### model.seed(data_array, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data_array | 
| callback | 

<a name="Model+delete"></a>

### model.delete(id, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| id | 
| callback | 

<a name="Model+fetch"></a>

### model.fetch(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+find"></a>

### model.find(query, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| query | 
| callback | 

**Example**  
```js
//simple query object, we will compare the exact valueslet query = { foo: 'a foo' bar: ['a bar 1', 'a bar 2']}model.find(query);//query object with regexlet query = { foo: '/a f/i' bar: ['a bar 1', 'a bar 2']}model.find(query);
```
<a name="Model+drop"></a>

### model.drop([recreate], callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param | Type |
| --- | --- |
| [recreate] | <code>boolean</code> | 
| callback | <code>function</code> | 

**Example**  
```js
//drops the storemodel.drop(() => () => { //...do something})//drops the store and recreates an empty storemodel.drop(true, () => { //...do something})
```
<a name="Query"></a>

## Query
**Kind**: global class  

* [Query](#Query)
    * [new Query(query, schema_analyzer)](#new_Query_new)
    * [.keys()](#Query+keys) ⇒ <code>Array</code>
    * [.value(key)](#Query+value) ⇒ <code>\*</code>
    * [.approximation(key)](#Query+approximation)
    * [.array(key)](#Query+array)

<a name="new_Query_new"></a>

### new Query(query, schema_analyzer)
!FOR ADAPTER DEVELOPERS ONLY!


| Param | Type |
| --- | --- |
| query | <code>Object</code> | 
| schema_analyzer | <code>SchemaAnalyzer</code> | 

<a name="Query+keys"></a>

### query.keys() ⇒ <code>Array</code>
**Kind**: instance method of <code>[Query](#Query)</code>  
<a name="Query+value"></a>

### query.value(key) ⇒ <code>\*</code>
**Kind**: instance method of <code>[Query](#Query)</code>  

| Param |
| --- |
| key | 

<a name="Query+approximation"></a>

### query.approximation(key)
**Kind**: instance method of <code>[Query](#Query)</code>  

| Param |
| --- |
| key | 

<a name="Query+array"></a>

### query.array(key)
**Kind**: instance method of <code>[Query](#Query)</code>  

| Param |
| --- |
| key | 

