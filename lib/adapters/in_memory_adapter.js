/**
 * Created by kalle on 06.04.2016.
 */
const Errors = require('./../errors.js');

const DATA = {};

const InMemoryAdapter = function (getIndexKey, schema_analyzer, options) {

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

    this.find = (query_analyzer, callback) => { //TODO: implement functions as query value
        let result = [];
        let query_index_key = getIndexKey(query_analyzer.approximately());
        let query_values = query_index_key
            .substring(model_name.length + 1, query_index_key.length)
            .replace('null~', '')
            .split('~');

        console.log('---------------------------------------------');
        console.log('query values', query_values, 'query index key', query_index_key);
        console.log('---------------------------------------------');

        Object.keys(DATA[model_name]).forEach((index_key) => {
            //a exact query fullfilled index match
            if (index_key === query_index_key)
                return result.push(DATA[model_name][index_key]);

            //approximation match
            if (query_values.every(qv => String(index_key).includes(qv))) {
                console.log('-> approximate match:', index_key, ' <-> ', query_index_key, query_values);
                //check exact match
                let match = DATA[model_name][index_key];
                if (query_analyzer.keys().every((qk) => {

                        //query item has exact match (for arrays, one must contain the exact string)
                        if ([].concat(match[qk]).some(mi => String(mi) === String(query_analyzer.value(qk)))) {
                            console.log('--> full match:', qk);
                            return true;
                        }
                        //starts with check: for string or array of strings, whereas numbers are converted.
                        if ([].concat(match[qk]).some(mi => String(mi).startsWith(query_analyzer.left(qk)))) { //would work with arrays but we ind array e must do it for every item....
                            console.log('--> left match:', qk);
                            return true;
                        }

                    })) {
                    console.log('---> evaluated match', index_key, query_index_key);
                    result.push(match);
                }

            }
        });


        return callback(null, result);

        //old

        //approximation
        query_values = getIndexKey(query_analyzer.approximately()).split('~null'); //it also supports nullable index keys.. if they can be nullable...
        Object.keys(DATA[model_name]).forEach((index_key) => {
            if (query_values.every(qp => String(index_key).includes(qp)))
                result.push(DATA[model_name][index_key]);
        });

        //filter for exact equality
        let query_keys = Object.keys(query);
        result = result.filter((res_item) => {
            return query_keys.every((qk) => {
                if (Array.isArray(res_item[qk]))
                    return true; //the array was already sorted and joined through query_values (getIndexId), so if item has been found because of array index, it's valid

                return query[qk] === res_item[qk];
            });
        }).map((res_item) => {
            res_item._id = getIndexKey(res_item);
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