/**
 * Created by kalle on 06.04.2016.
 */
const Errors = require('./../errors.es6');

const DATA = {};

class InMemoryAdapter {

    constructor(getIndexId, index, options){
        this._getIndexId = getIndexId;
        this._index = index;
        this._options = options;
        this._model_name = options.model_name;
    }

    connect(callback){
        this._conn = true;
        DATA[this._model_name] = DATA[this._model_name] || {};
        callback(null);
    }

    close(callback){
        callback(null);
    }

    count(callback){
        callback(null, Object.keys(DATA[this._model_name]).length);
    }

    exists(id, callback){
        callback(null, DATA[this._model_name][id] !== undefined);
    }

    insert(model, callback) {
        let id = model._id = this._getIndexId(model);
        this.exists(id, (err, exists) => {
            if (exists)
                return callback(new Errors.DuplicateKeyError(id));

            else {
                DATA[this._model_name][id] = model;
                return callback(null, model);
            }
        });
    };

    update(id, model, callback) {
        this.fetch(id, (err, existing_model) => {
            if (existing_model) {
                model._created =  existing_model._created;
                DATA[this._model_name][id] = model;
                model._id = this._getIndexId(model);
                return callback(null, model);
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    upsert(model, callback) {
        let id = model._id = this._getIndexId(model);
        this.fetch(id, (err, existing_model) => {
            if (existing_model)
                model._created =  existing_model._created;
        });
        DATA[this._model_name][id] = model;
        return callback(null, model);
    };

    delete(id, callback) {
        //let existing= _data.findIndex(i => i._id === id);
        if (DATA[this._model_name][id])
            delete DATA[this._model_name][id];

        return callback(null, id);
    };

    fetch(id, callback) {
        let model = DATA[this._model_name][id];
        return callback(null, model);
    };

    find(query, callback){
        let result = [];
        //approximation
        let query_values = this._getIndexId(query).split('~null');
        Object.keys(DATA[this._model_name]).forEach((index) => {
            if (query_values.every(qp => String(index).includes(qp)))
                result.push(DATA[this._model_name][index]);
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
            res_item._id = this._getIndexId(res_item); //TODO take out _id so it's not written to database in all other methods
            return res_item;
        });
        callback(null, result);
    }

    drop(callback){
        DATA[this._model_name] = {};
        callback();
    }
}
module.exports = InMemoryAdapter;