## Classes

<dl>
<dt><a href="#NotFoundError">NotFoundError</a></dt>
<dd><p>Created by kalle on 04.04.2016.</p>
</dd>
<dt><a href="#Model">Model</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#Model">Model</a></dt>
<dd><p>Created by colonaut on 08.04.2016.</p>
</dd>
</dl>

<a name="NotFoundError"></a>

## NotFoundError
Created by kalle on 04.04.2016.

**Kind**: global class  
<a name="Model"></a>

## Model
**Kind**: global class  

* [Model](#Model)
    * [new Model(schema, index, model_name)](#new_Model_new)
    * [.adapter](#Model+adapter) ⇒ <code>adapter</code>
    * [.getIndexId(model)](#Model+getIndexId) ⇒ <code>string</code>
    * [.validate(data, callback)](#Model+validate)
    * [.drop([recreate], callback)](#Model+drop)

<a name="new_Model_new"></a>

### new Model(schema, index, model_name)
constructor


| Param | Type |
| --- | --- |
| schema |  | 
| index |  | 
| model_name |  | 
| options.adapter | <code>string</code> &#124; <code>function</code> | 
| options.db | <code>string</code> | 
| options.host | <code>string</code> | 
| options.port | <code>number</code> | 

<a name="Model+adapter"></a>

### model.adapter ⇒ <code>adapter</code>
get the adapter

**Kind**: instance property of <code>[Model](#Model)</code>  
<a name="Model+getIndexId"></a>

### model.getIndexId(model) ⇒ <code>string</code>
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| model | 

<a name="Model+validate"></a>

### model.validate(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
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
<a name="Model"></a>

## Model
Created by colonaut on 08.04.2016.

**Kind**: global variable  

* [Model](#Model)
    * [new Model(schema, index, model_name)](#new_Model_new)
    * [.adapter](#Model+adapter) ⇒ <code>adapter</code>
    * [.getIndexId(model)](#Model+getIndexId) ⇒ <code>string</code>
    * [.validate(data, callback)](#Model+validate)
    * [.drop([recreate], callback)](#Model+drop)

<a name="new_Model_new"></a>

### new Model(schema, index, model_name)
constructor


| Param | Type |
| --- | --- |
| schema |  | 
| index |  | 
| model_name |  | 
| options.adapter | <code>string</code> &#124; <code>function</code> | 
| options.db | <code>string</code> | 
| options.host | <code>string</code> | 
| options.port | <code>number</code> | 

<a name="Model+adapter"></a>

### model.adapter ⇒ <code>adapter</code>
get the adapter

**Kind**: instance property of <code>[Model](#Model)</code>  
<a name="Model+getIndexId"></a>

### model.getIndexId(model) ⇒ <code>string</code>
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| model | 

<a name="Model+validate"></a>

### model.validate(data, callback)
**Kind**: instance method of <code>[Model](#Model)</code>  

| Param |
| --- |
| data | 
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
