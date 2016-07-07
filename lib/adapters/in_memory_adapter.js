/**
 * Created by kalle on 06.04.2016.
 */
const Errors = require('./../errors.js');

const DATA = {};

const InMemoryAdapter = function(getIndexId, schema_analyzer, options) {

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
        let id = getIndexId(model);
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
                model._created =  existing_model._created;
                DATA[model_name][id] = model;
                model._id = getIndexId(model);
                return callback(null, model);
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    this.upsert = (model, callback) => {
        let id = getIndexId(model);
        
        
        this.fetch(id, (err, existing_model) => {
            if (existing_model)
                model._created =  existing_model._created;

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

    this.find = (query, callback) => {
        let result = [];
        //approximation
        let query_values = getIndexId(query).split('~null');
        Object.keys(DATA[model_name]).forEach((index) => {
            if (query_values.every(qp => String(index).includes(qp)))
                result.push(DATA[model_name][index]);
        });
        //filter for exact equality
        let query_keys = Object.keys(query);
        result = result.filter((res_item) => {
            return query_keys.every((qk) => {
                if (Array.isArray(res_item[qk]))
                    return true; //the array was already sorted and joined, so if item has been found because of array index, it's valid

                return query[qk] === res_item[qk];
            });
        }).map((res_item) => {
            res_item._id = getIndexId(res_item);
            return res_item;
        });
        callback(null, result);
    };

    this.drop = (recreate, callback) => {
        delete DATA[model_name];
        if (recreate)
            DATA[model_name] = {};

        callback();
    };
};

module.exports = InMemoryAdapter;