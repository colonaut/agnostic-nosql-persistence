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
