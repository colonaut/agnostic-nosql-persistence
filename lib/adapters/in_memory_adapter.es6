/**
 * Created by kalle on 06.04.2016.
 */
import * as Errors from './../errors';

const DATA = {};

export default class InMemoryAdapter {

    constructor(getIndexId, model_name){
        this._model_name = model_name || 'default';
        this._getIndexId = getIndexId;
    }

    connect(callback){
        DATA[this._model_name] = DATA[this._model_name] || {};
        callback();
    }

    close(callback){
        callback();
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
        //TODO
    }

    drop(callback){
        DATA[this._model_name] = {};
        callback();
    }
}