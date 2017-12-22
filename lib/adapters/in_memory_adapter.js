'use strict';
const Errors = require('./../errors.js');
const DATA = {};

module.exports = function (getIndexKey, resolved_schema, options) {
    let model_name = options.model_name;

    this.connect = (callback) => {
        DATA[model_name] = DATA[model_name] || {};
        callback(null);
    };

    this.close = (callback) => {
        callback(null);
    };

    this.count = (callback) => {
        callback(null, Object.keys(DATA[model_name]).length);
    };

    this.exists = (id, callback) => {
        callback(null, DATA[model_name][id] !== undefined);
    };

    this.insert = (model, callback) => {
        getIndexKey(model, (err, id) => {
            this.exists(id, (err, exists) => {
                if (exists)
                    return callback(new Errors.DuplicateKeyError(id));

                else {
                    DATA[model_name][id] = model;
                    model._id = id;
                    return callback(err, model);
                }
            });
        });
    };

    this.update = (id, model, callback) => {
        this.fetch(id, (err, existing_model) => {
            if (existing_model) {
                model._created = existing_model._created;
                DATA[model_name][id] = model;
                getIndexKey(model, (err, index_key) => {
                    model._id = index_key;
                    return callback(err, model);
                });
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    this.upsert = (model, callback) => {
        getIndexKey(model, (err, index_key) => {
            this.fetch(index_key, (err, existing_model) => {
                if (existing_model)
                    model._created = existing_model._created;

                DATA[model_name][index_key] = model;
                model._id = index_key;
                return callback(null, model);
            });
        });
    };

    this.delete = (id, callback) => {
        //let existing= _data.findIndex(i => i._id === id);
        if (DATA[model_name][id])
            delete DATA[model_name][id];

        return callback(null, id);
    };

    this.fetch = (id, callback) => {
        let model = DATA[model_name][id];
        if (model)
            model._id = id;

        return callback(null, model);
    };

    this.find = (resolved_query, callback) => { //TODO: BLOCKS?!
        let result = [];
        let index_keys = Object.keys(DATA[model_name]);
        const process = (items) => {
            let data = DATA[model_name][items.shift()];
            resolved_query.match(data, (err, is_matched) => {
                if (err)
                    return callback(err);

                if (is_matched)
                    result.push(data);

                if (items.length > 0)
                    return process(items);

                return callback(null, result);
            });
        };
        process(index_keys);
    };

    this.drop = (recreate, callback) => {
        delete DATA[model_name];
        if (recreate)
            DATA[model_name] = {};

        callback();
    };
};

//module.exports = InMemoryAdapter;