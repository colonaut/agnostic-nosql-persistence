'use strict';
const Joi = require('joi');
const Adapters = require('./adapters');
const Errors = require('./errors');
const QueryAnalyzer = require('./query_analyer');
const analyzeSchema = require('analyze-schema');

const default_options = {
    //uri: './db',
    persistence_adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};

//TODO: _id, _v, modified_at, created_at
//TODO: use memdown and leveldb for in memory? might be faster.....

/**
 * @param schema
 * @param index
 * @param [model_name]
 * @param {object} options Options
 * @param {string|function} options.adapter
 * @param {string} options.db
 * @param {string} options.host
 * @param {number} options.port
 * @constructor
 */
const Model = function (schema, index, model_name, options) {

    if (typeof model_name !== 'string') {
        options = model_name;
        model_name = this.constructor.name;
    }

    options = Object.assign({}, default_options, options || {});
    const schema_analyzer = analyzeSchema(schema, {index: index});

    const validateParams = () => {
        if (!schema.isJoi)
            throw new Error('schema has to be a Joi schema');

        if (!Array.isArray(index))
            throw new Error('Index has to an array');

        if (index.length < 0)
            throw new Error('Index must contain at least one item');
    }

    let adapter_instance;
    const adapter = () => {
        if (!adapter_instance) {
            let adapter = options.persistence_adapter;
            adapter = adapter === 'function' ? adapter
                : Adapters[adapter] ? Adapters[adapter]
                : Adapters[default_options.persistence_adapter];

            let merged_options = Object.assign({
                model_name: model_name,
                db: 'anp_default'
            }, options);

            adapter_instance = new adapter(
                this.getIndexKey,//.bind(this), //TODO: need binding? seems not to be neccessary
                schema_analyzer,
                merged_options
            );

            ['insert', 'upsert', 'update', 'delete',
                'exists', 'fetch', 'find',
                'connect', 'drop', 'count', 'close'].forEach((method) => {
                if (typeof adapter_instance[method] !== 'function')
                    throw new Errors.NotImplementedError(method, adapter_instance);
            });
        }
        return adapter_instance;
    };

    /**
     * @param data
     * @returns {string}
     */
    this.getIndexKey = (data) => {
        let id = model_name + options.id_separator;
        let index_value;
        [].concat(index).forEach((index_item) => {
            index_value = data[index_item] || 'null';
            if (Array.isArray(index_value))
                index_value = index_value
                //.filter(index_value_item => typeof index_value_item === 'string' || typeof index_value_item === 'number')
                    .map(index_value_item => index_value_item.replace(/~|\s/g, ''))
                    .sort().join();
            id += index_value.toString().replace(/~/g, '') + options.id_separator;
        });
        return id.substr(0, id.length - 1).replace(/\s/g, '');
    }

    /**
     *
     * @param data
     * @param callback
     */
    this.validate = (data, callback) => {
        Joi.validate(data, schema, callback);
    };

    /**
     *
     * @param callback
     */
    this.connect = (callback) => {
        adapter().connect(callback);
    };

    /**
     *
     * @param id
     * @param callback
     */
    this.exists = (id, callback) => {
        adapter().exists(id, callback);
    };

    /**
     *
     * @param data
     * @param callback
     */
    this.insert = (data, callback) => {
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id; //should not exist here, dunno if we need that

        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = options.version;
            return adapter().insert(result, callback);
        });
    };

    /**
     *
     * @param callback
     */
    this.count = (callback) => {
        adapter().count(callback);
    };

    /**
     *
     * @param id
     * @param data
     * @param callback
     */
    this.update = (id, data, callback) => {
        let clone = Object.assign({}, data); //enough for deep clone?
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            let data_id = this.getIndexKey(result);
            if (id !== data_id)
                return callback('Conflict: Updating the id during an update is not allowed.')

            result._modified = new Date();
            result._v = options.version;
            return adapter().update(id, result, callback);
        });
    };

    /**
     *
     * @param data
     * @param callback
     */
    this.upsert = (data, callback) => {
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id;
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = options.version;
            return adapter().upsert(result, callback);
        });
    };

    /**
     *
     * @param data_array
     * @param callback
     */
    this.seed = (data_array, callback) => {
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
    };

    /**
     *
     * @param id
     * @param callback
     */
    this.delete = (id, callback) => {
        adapter().delete(id, callback);
    };

    /**
     *
     * @param data
     * @param callback
     */
    this.fetch = (data, callback) => {
        adapter().fetch(data, callback);
    };

    /**
     *
     * @param query
     * @param callback
     * @example
     * //simple query object, we will compare the exact values
     * let query = {
     *  foo: 'a foo'
     *  bar: ['a bar 1', 'a bar 2']
     * }
     * model.find(query);
     * //query object with regex
     * let query = {
     *  foo: '/a f/i'
     *  bar: ['a bar 1', 'a bar 2']
     * }
     * model.find(query);
     */
    this.find = (query, callback) => {
        adapter().find(new QueryAnalyzer(query, schema_analyzer), callback);
    };

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
    this.drop = (recreate, callback) => { //drop database
        let v_callback = callback;
        if (!callback) {
            v_callback = recreate;
            recreate = false;
        }
        adapter().drop(recreate, v_callback);
    };

    /**
     *
     * @param callback
     */
    this.close = (callback) => {
        adapter().close(callback);
    };
};

module.exports = Model;