/**
 * Created by kalle on 04.04.2016.
 */
'use strict';
const Joi = require('joi');
const Adapters = require('./adapters');
const Errors = require('./errors.js');
const analyzeSchema = require('analyze-schema');

const default_options = {
    //uri: './db',
    persistence_adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};

//TODO: _id, _v, modified_at, created_at

class Model {
    /**
     * @class Model
     * @param schema
     * @param index
     * @param model_name
     * @param {object} [options] Options
     * @param {string|function} options.adapter
     * @param {string} options.db
     * @param {string} options.host
     * @param {number} options.port
     */
    constructor(schema, index, model_name, options) { //TODO model_name in options?
        this._index = index;
        this._schema = schema;

        if (typeof model_name === 'string') {
            this._model_name = model_name;
        } else {
            this._model_name = this.constructor.name;
            options = model_name;
        }

        this._options = Object.assign({}, default_options, options || {});
    }


    _validateParams(){
        if (! this._schema.isJoi)
            throw new Error('schema has to be a Joi schema');

        if (!Array.isArray(this._index))
            throw new Error('Index has to an array');

        if  (this._index.length < 0)
            throw new Error('Index must contain at least one item');
    }

    /**
     * get the adapter
     * @returns {adapter}
     */
    get adapter(){
        if (!this._adapter_instance) {
            let adapter = this._options.persistence_adapter;
            adapter = adapter === 'function' ? adapter
                : Adapters[adapter] ? Adapters[adapter]
                : Adapters[default_options.persistence_adapter];

            let options = Object.assign({
                model_name: this._model_name,
                db: 'anp_default'
            }, this._options);

            this._adapter_instance = new adapter(
                this.getIndexId.bind(this),
                analyzeSchema(this._schema, { index: this._index }),
                options
            );

            ['insert', 'upsert', 'update', 'delete',
            'exists', 'fetch', 'find',
            'connect', 'drop', 'count', 'close'].forEach((m) => {
            if (typeof this._adapter_instance[m] !== 'function')
                throw new Errors.NotImplementedError(m, this._adapter_instance);
            });
        }
        return this._adapter_instance;
    }

    /**
     *
     * @param model
     * @returns {string}
     */
    getIndexId(model) {
        let id = this._model_name + this._options.id_separator;
        let index_value;
        this._index.forEach((index_item) => {
            index_value = model[index_item] || 'null';
            if (Array.isArray(index_value))
                index_value = index_value
                    //.filter(index_value_item => typeof index_value_item === 'string' || typeof index_value_item === 'number')
                    .map(index_value_item => index_value_item.replace(/~|\s/g, ''))
                    .sort().join();
            id += index_value.toString().replace(/~/g, '') + this._options.id_separator;
        });
        return id.substr(0, id.length - 1).replace(/\s/g, '');
    }

    /**
     *
     * @param data
     * @param callback
     */
    validate(data, callback) {
        Joi.validate(data, this._schema, callback);
    };


    connect(callback){
        this.adapter.connect(callback);
    }

    exists(id, callback){
        this.adapter.exists(id, callback);
    }

    insert(data, callback) {
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id; //should not exist here, dunno if we need that

        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = this._options.version;
            return this.adapter.insert(result, callback);
        });
    };

    count(callback){
        this.adapter.count(callback);
    }

    update(id, data, callback){
        let clone = Object.assign({}, data); //enough for deep clone?
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            let data_id = this.getIndexId(result);
            if(id !== data_id)
                return callback('Conflict: Updating the id during an update is not allowed.')

            result._modified = new Date();
            result._v = this._options.version;
            return this.adapter.update(id, result, callback);
        });
    }

    upsert(data, callback){
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id;
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = this._options.version;
            return this.adapter.upsert(result, callback);
        });
    }

    seed(data_array, callback){
        data_array = [].concat(data_array);
        let result = 0;
       for (let data of data_array) {
            this.upsert(data, function (err, res) {
                if (err)
                    console.error(err.toString());
                else
                    result++;
            });
        }
        callback(null, result);
    }

    delete(id, callback){
        this.adapter.delete(id, callback);
    }

    fetch(data, callback){
        this.adapter.fetch(data, callback);
    }

    find(query, callback){
        this.adapter.find(query, callback);
    }

    /**
     * @param {boolean} [recreate]
     * @param {function} callback
     * @example
     * //drops the store
     * model.drop(() => () => {
     *  //...do something
     * })
     * //drops the store and recreates an empty store
     * model.drop(true, () => {
     *  //...do something
     * })
     */
    drop(recreate, callback){ //drop database
        let v_callback = callback;
        if (!callback) {
            v_callback = recreate;
            recreate = false;
        }
        this.adapter.drop(recreate, v_callback);
    }

    close(callback){
        this.adapter.close(callback);
    }

}
module.exports = Model;