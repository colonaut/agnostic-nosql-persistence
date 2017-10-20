## Modules

<dl>
<dt><a href="#module_persistenceModel">persistenceModel</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#Model">Model</a></dt>
<dd></dd>
</dl>

<a name="module_persistenceModel"></a>

## persistenceModel

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>Joi</code> &#124; <code>JSONSchema</code> |  |
| index | <code>array</code> |  |
| [model_name] | <code>string</code> |  |
| options | <code>object</code> | Options |
| options.adapter | <code>string</code> &#124; <code>function</code> |  |
| options.db | <code>string</code> |  |
| options.host | <code>string</code> |  |
| options.port | <code>number</code> |  |
| [callback] | <code>function</code> | (err, persistence_model) |

<a name="Model"></a>

## Model
**Kind**: global class  

* [Model](#Model)
    * [new Model(resolved_schema, index, [model_name], options)](#new_Model_new)
    * [.getIndexKey(data)](#Model+getIndexKey) ⇒ <code>string</code>
    * [.validate(data, [callback])](#Model+validate) ⇒ <code>Promise.&lt;object&gt;</code>
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
    * [.close(callback)](#Model+close)

<a name="new_Model_new"></a>

### new Model(resolved_schema, index, [model_name], options)

| Param | Type | Description |
| --- | --- | --- |
| resolved_schema | <code>ResolvedSchema</code> |  |
| index |  |  |
| [model_name] |  |  |
| options | <code>object</code> | Options |
| options.adapter | <code>string</code> &#124; <code>function</code> |  |
| options.db | <code>string</code> |  |
| options.host | <code>string</code> |  |
| options.port | <code>number</code> |  |

<a name="Model+getIndexKey"></a>

### model.getIndexKey(data) ⇒ <code>string</code>
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| data | 

**Example**  
```js
//lorum ipsum
```
<a name="Model+validate"></a>

### model.validate(data, [callback]) ⇒ <code>Promise.&lt;object&gt;</code>
**Kind**: instance method of <code>[Model](#Model)</code>  
**Returns**: <code>Promise.&lt;object&gt;</code> - If callback is not passed  
**Methodof**: Model  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> |  |
| [callback] | <code>function</code> | If not passed, a promise will be returned |

<a name="Model+connect"></a>

### model.connect(callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| callback | 

<a name="Model+exists"></a>

### model.exists(id, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| id | 
| callback | 

<a name="Model+insert"></a>

### model.insert(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+count"></a>

### model.count(callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| callback | 

<a name="Model+update"></a>

### model.update(id, data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| id | 
| data | 
| callback | 

<a name="Model+upsert"></a>

### model.upsert(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+seed"></a>

### model.seed(data_array, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| data_array | 
| callback | 

<a name="Model+delete"></a>

### model.delete(id, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| id | 
| callback | 

<a name="Model+fetch"></a>

### model.fetch(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| data | 
| callback | 

<a name="Model+find"></a>

### model.find(query, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param | Type |
| --- | --- |
| query | <code>object</code> | 
| callback | <code>function</code> | 

**Example**  
```js
//simple query object, we will compare the exact valueslet query = { foo: 'a foo' bar: ['a bar 1', 'a bar 2']}model.find(query);//query object with regexlet query = { foo: '/a f/i' bar: ['a bar 1', 'a bar 2']}model.find(query);
```
<a name="Model+drop"></a>

### model.drop([recreate], callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: ModelDrops the data store (db, keyspace, ...)  

| Param | Type |
| --- | --- |
| [recreate] | <code>boolean</code> | 
| callback | <code>function</code> | 

**Example**  
```js
//drops the storemodel.drop(() => () => { //...do something})//drops the store and recreates an empty storemodel.drop(true, () => { //...do something})
```
<a name="Model+close"></a>

### model.close(callback)
**Kind**: instance method of <code>[Model](#Model)</code>  
**Methodof**: Model  

| Param |
| --- |
| callback | 

