'use strict';
const Adapters = require('./adapters');
const Errors = require('./errors');
const resolveQuery = require('resolved-query');
const pluralize = require('pluralize');
const blocked = require('blocked');

const default_options = {
    //uri: './db',
    adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};
const Privates = new WeakMap();

const createIndexKey = (index, index_key, data, separator, callback) => {
    let index_value = data[index.shift()] || 'null';
    if (Array.isArray(index_value))
        index_value = index_value
        //.filter(index_value_item => typeof index_value_item === 'string' || typeof index_value_item === 'number')
            .map(index_value_item => index_value_item.replace(/~|\s/g, ''))
            .sort().join();
    index_key += index_value.toString().replace(/~/g, '') + separator;

    if (index.length > 0)
        return createIndexKey(index, index_key, data, separator, callback);

    index_key = index_key.substr(0, index_key.length - 1).replace(/\s/g, '');
    return callback(null, index_key);
};

//TODO: _id, _v, modified_at, created_at
//TODO: use memdown and leveldb for in memory? might be faster.....

/**
 * @param {ResolvedSchema} resolved_schema
 * @param {string} [model_name]
 * @param {object} options Options
 * @param {string|function} options.adapter
 * @param {string} options.db
 * @param {string} options.host
 * @param {number} options.port
 * @constructor
 */
class PersistenceModel {
    constructor(resolved_schema, model_name, options){
        if (typeof model_name !== 'string') {
            options = model_name;
            model_name = this.constructor.name;
        }
        options = Object.assign({}, default_options, options || {});

        let adapter = options.adapter;
        adapter = typeof adapter === 'function'
            ? adapter
            : Adapters[adapter]
                ? Adapters[adapter]
                : Adapters[default_options.adapter];

        let adapter_options = Object.assign({
            model_name: model_name,
            db_name: options.db || pluralize(model_name)
        }, options);

        let adapter_instance = new adapter(
            this.getIndexKey, //.bind(this), //TODO: need binding? seems not to be necessary
            resolved_schema,
            adapter_options
        );

        Privates.set(this, {
            adapter: adapter_instance,
            index: resolved_schema.index(),//[].concat(index),
            model_name: model_name,
            options: options,
            resolved_schema: resolved_schema
        });

        blocked((ms) => {
            console.warn('"PersistenceModel" blocked for %sms', ms | 0);
        }, {threshold: 1});
    }

    /**
     * @param data
     * @returns {string}
     * @example
     * //lorum ipsum
     */
    getIndexKey(data, callback) { //TODO: with callback! event loop! and maybe better in resolved-schema. get rid of return and then put it to resolved_schema
        createIndexKey([].concat(Privates.get(this).index),
            Privates.get(this).model_name + Privates.get(this).options.id_separator,
            data,
            Privates.get(this).options.id_separator,
            callback);
    }

    /**
     * @param {object} data
     * @param {function} [callback] If not passed, a promise will be returned
     * @returns {Promise<object>} If callback is not passed
     */
    validate(data, callback){
        return Privates.get(this).resolved_schema.validate(data, callback);
    }

    /**
     * @param callback
     */
    connect(callback) {
        Privates.get(this).adapter.connect(callback);
    }

    /**
     * @param id
     * @param callback
     */
    exists(id, callback) {
        Privates.get(this).adapter.exists(id, callback);
    };

    /**
     * @param data
     * @param callback
     */
    insert(data, callback) {
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id; //should not exist here, dunno if we need that

        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = options.version;
            return Privates.get(this).adapter.insert(result, callback);
        });
    };

    /**
     * @param callback
     */
    count(callback) {
        Privates.get(this).adapter.count(callback);
    };

    /**
     * @param id
     * @param data
     * @param callback
     */
    update(id, data, callback) {
        let clone = Object.assign({}, data); //enough for deep clone?
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            this.getIndexKey(result, (err, index_key) => {
                if (id !== index_key)
                    return callback('Conflict: Updating the id during an update is not allowed.');

                result._modified = new Date();
                result._v = Privates.get(this).options.version;
                return Privates.get(this).adapter.update(id, result, callback);
            });
        });
    };

    /**
     * @param data
     * @param callback
     */
    upsert(data, callback) {
        let clone = Object.assign({}, data); //enough for deep clone?
        delete clone._id;
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            result._modified = result._created = new Date();
            result._v = Privates.get(this).options.version;
            return Privates.get(this).adapter.upsert(result, callback);
        });
    };

    /**
     * @param data_array
     * @param callback
     */
    seed(data_array, callback) {
        let successful = 0;
        const recursive = (data_array, i) => {
            i = i || 0;
            if (i === data_array.length)
                return callback(null, successful);

            this.upsert(data_array[i], (err) => {
                if (err)
                    console.error(err);

                successful++;
                recursive(data_array, i + 1);
            });
        };
        recursive([].concat(data_array));
    };

    /**
     * @param id
     * @param callback
     */
    delete(id, callback) {
        Privates.get(this).adapter.delete(id, callback);
    };

    /**
     * @param data
     * @param callback
     */
    fetch(data, callback) {
        Privates.get(this).adapter.fetch(data, callback);
    };

    /**
     * @param {object} query
     * @param {function} callback
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
    find(query, callback) {
        resolveQuery(query, Privates.get(this).resolved_schema)
            .then((resolved_query) => {
                Privates.get(this).adapter.find(resolved_query, callback);
            }).catch((err) => {
            return callback(err);
        });
    };

    /**
     * Drops the data store (db, keyspace, ...)
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
    drop(recreate, callback) { //drop database
        let v_callback = callback;
        if (!callback) {
            v_callback = recreate;
            recreate = false;
        }
        Privates.get(this).adapter.drop(recreate, v_callback);
    };

    /**
     * @param callback
     */
    close(callback) {
        Privates.get(this).adapter.close(callback);
    };
}

module.exports = PersistenceModel;