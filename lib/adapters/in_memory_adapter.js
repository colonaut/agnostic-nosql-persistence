'use strict';
const Errors = require('./../errors.js');
const DATA = {};

const InMemoryAdapter = function (getIndexKey, resolved_schema, options) {


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
        let id = getIndexKey(model);
        this.exists(id, (err, exists) => {
            if (exists)
                return callback(new Errors.DuplicateKeyError(id));

            else {
                DATA[model_name][id] = model;
                model._id = id;
                return callback(null, model);
            }
        });
    };

    this.update = (id, model, callback) => {
        this.fetch(id, (err, existing_model) => {
            if (existing_model) {
                model._created = existing_model._created;
                DATA[model_name][id] = model;
                model._id = getIndexKey(model);
                return callback(null, model);
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    this.upsert = (model, callback) => {
        let id = getIndexKey(model);


        this.fetch(id, (err, existing_model) => {
            if (existing_model)
                model._created = existing_model._created;

            DATA[model_name][id] = model;
            model._id = id;
            return callback(null, model);
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

    this.find = (resolved_query, callback) => { //TODO: implement functions as query value
        let result = [];
        let checked = Object.keys(DATA[model_name]).length;
        Object.keys(DATA[model_name]).forEach((index_key) => {
            let data = DATA[model_name][index_key];
            resolved_query.match(data, (err, is_matched) => {
                if (err)
                    return callback(err);

                if (is_matched)
                    result.push(data);

                checked--;

                if (checked === 0)
                    return callback(null, result);
            });
        });
    };

    this.drop = (recreate, callback) => {
        delete DATA[model_name];
        if (recreate)
            DATA[model_name] = {};

        callback();
    };
};

module.exports = InMemoryAdapter;