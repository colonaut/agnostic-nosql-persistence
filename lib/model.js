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

//TODO: _id, _v, modified_at, created_at
//TODO: use memdown and leveldb for in memory? might be faster.....

/**
 * @param {ResolvedSchema} resolved_schema
 * @param index
 * @param [model_name]
 * @param {object} options Options
 * @param {string|function} options.adapter
 * @param {string} options.db
 * @param {string} options.host
 * @param {number} options.port
 * @constructor
 */
function Model(resolved_schema, index, model_name, options) {
    if (typeof model_name !== 'string') {
        options = model_name;
        model_name = this.constructor.name;
    }
    options = Object.assign({}, default_options, options || {});

    const validateParams = () => {
        if (!schema.isJoi)
            throw new Error('schema has to be a Joi schema');

        if (!Array.isArray(index))
            throw new Error('Index has to an array');

        if (index.length < 0)
            throw new Error('Index must contain at least one item');
    };

    let adapter_instance; //TODO: event loop!
    const adapter = () => {
        if (!adapter_instance) {
            let adapter = options.adapter;
            adapter = adapter === 'function' ? adapter
                : Adapters[adapter] ? Adapters[adapter]
                    : Adapters[default_options.adapter];

            let adapter_options = Object.assign({
                model_name: model_name,
                db_name: options.db || pluralize(model_name)
            }, options);

            adapter_instance = new adapter(
                this.getIndexKey,//.bind(this), //TODO: need binding? seems not to be neccessary
                resolved_schema,
                adapter_options
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
     * @methodOf Model
     * @param data
     * @returns {string}
     * @example
     * //lorum ipsum
     */
    this.getIndexKey = (data, callback) => { //TODO: with callback? event loop! and maybe better in resolved-schema
        let index_key = model_name + options.id_separator;
        let index_value;
        [].concat(index).forEach((index_item) => {
            index_value = data[index_item] || 'null';
            if (Array.isArray(index_value))
                index_value = index_value
                //.filter(index_value_item => typeof index_value_item === 'string' || typeof index_value_item === 'number')
                    .map(index_value_item => index_value_item.replace(/~|\s/g, ''))
                    .sort().join();
            index_key += index_value.toString().replace(/~/g, '') + options.id_separator;
        });
        index_key = index_key.substr(0, index_key.length - 1).replace(/\s/g, '');

        if (callback)
            return callback(null, index_key);

        return index_key;
    };

    /**
     * @methodOf Model
     * @param {object} data
     * @param {function} [callback] If not passed, a promise will be returned
     * @returns {Promise<object>} If callback is not passed
     */
    this.validate = (data, callback) => resolved_schema.validate(data, callback);

    /**
     * @methodOf Model
     * @param callback
     */
    this.connect = (callback) => {
        adapter().connect(callback);
    };

    /**
     * @methodOf Model
     * @param id
     * @param callback
     */
    this.exists = (id, callback) => {
        adapter().exists(id, callback);
    };

    /**
     * @methodOf Model
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
     * @methodOf Model
     * @param callback
     */
    this.count = (callback) => {
        adapter().count(callback);
    };

    /**
     * @methodOf Model
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
     * @methodOf Model
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
     * @methodOf Model
     * @param data_array
     * @param callback
     */
    this.seed = (data_array, callback) => {
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
     * @methodOf Model
     * @param id
     * @param callback
     */
    this.delete = (id, callback) => {
        adapter().delete(id, callback);
    };

    /**
     * @methodOf Model
     * @param data
     * @param callback
     */
    this.fetch = (data, callback) => {
        adapter().fetch(data, callback);
    };

    /**
     * @methodOf Model
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
    this.find = (query, callback) => {
        resolveQuery(query, resolved_schema)
            .then((resolved_query) => {
                adapter().find(resolved_query, callback);
            }).catch((err) => {
            return callback(err);
        });
    };

    /**
     * @methodOf Model
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
    this.drop = (recreate, callback) => { //drop database
        let v_callback = callback;
        if (!callback) {
            v_callback = recreate;
            recreate = false;
        }
        adapter().drop(recreate, v_callback);
    };

    /**
     * @methodOf Model
     * @param callback
     */
    this.close = (callback) => {
        adapter().close(callback);
    };


    blocked((ms) => {
        console.warn('"PersistenceModel" blocked for %sms', ms | 0);
    }, {threshold: 1});
}

module.exports = Model;