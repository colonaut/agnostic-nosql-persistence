/**
 * Created by kalle on 04.04.2016.
 */
import Joi from 'joi';
import * as Adapters from './adapters';
import * as Errors from './errors';

const default_options = {
    uri: './db',
    persistence_adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};

export default class Model {
    constructor(schema, index, model_name, options) {
        this._options = Object.assign(default_options, options || {});

        this._model_name = model_name; //TODO: use constructor name if not set and in ecma6
        this._index = index;
        this._schema = schema;
    }

    _validateParams(){
        if (! this._schema.isJoi)
            throw new Error('schema has to be a Joi schema');

        if (!Array.isArray(this._index))
            throw new Error('Index has to an array');

        if  (this._index.length < 0)
            throw new Error('Index must contain at least one item');
    }


    get adapter(){
        if (!this._adapter_instance) {
           let adapter = this._options.persistence_adapter;
           adapter = adapter === 'function' ? adapter
                : Adapters[adapter] ? Adapters[adapter]
                : Adapters[default_options.persistence_adapter];

            this._adapter_instance = new adapter(this.getIndexId.bind(this), this._model_name);

            ['insert', 'upsert', 'update', 'delete',
            'exists', 'fetch', 'find',
            'connect', 'drop', 'count', 'close'].forEach((m) => {
            if (typeof this._adapter_instance[m] !== 'function')
                throw new Errors.NotImplementedError(m, this._adapter_instance);

            });
        }
        return this._adapter_instance;
    }


    getIndexId(model) { //bind to collection or model
        let id = (this._model_name || 'model') + this._options.id_separator;
        this._index.forEach((index_item) => {
            id += (model[index_item].replace(/~/g, '') || 'null') + this._options.id_separator;
        });
        return id.substr(0, id.length - 1).replace(/\s/g, '');
    }

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
        let clone = Object.create(data); //enough for deep clone?
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
        let clone = Object.create(data); //enough for deep clone?
        this.validate(clone, (err, result) => {
            if (err)
                return callback(err);

            let dataId = this.getIndexId(result);
            if(id !== dataId)
                return callback('Conflict: Updating the id during an update is not allowed.')

            result._modified = new Date();
            result._v = this._options.version;
            return this.adapter.update(id, result, callback);
        });
    }

    upsert(data, callback){
        let clone = Object.create(data); //enough for deep clone?
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
        let result = [];
        data_array.forEach((data) => {
            this.upsert(data, function (err, res) {
                if (err)
                    console.error(err.toString());
                else
                    result.push(res);
            });
        });
        callback(null, result);
    }

    delete(id, callback){
        this.adapter.delete(id, callback);
    }

    fetch(data, callback){
        this.adapter.fetch(data, callback);
    }

    drop(callback){ //drop database
        this.adapter.drop(callback);
    }

    close(callback){
        this.adapter.close(callback);
    }

}