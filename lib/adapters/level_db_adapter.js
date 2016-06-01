/**
 * Created by colonaut on 18.04.2016.
 */
const Errors = require('./../errors.js');
const levelup = require('levelup');
const leveldown = require('leveldown');


export default class LevelDbAdapter {

    constructor(getIndexId, getSchemaDetails, options){
        this._options = options;
        this._model_name = options.model_name || 'default';
        this._getIndexId = getIndexId;

        this.dbPath = this._options.uri || './db';
    }

    connect(callback) {
        if (this.db && this.db.isOpen())
            return callback();

        this.db = levelup(this.dbPath, {
            valueEncoding: 'json',
            keyEncoding: 'json'
        });

        this.db.on('ready', (err) => {
            return callback(err);
        });
    };

    close(callback){
        if(this.db){
            this.db.close(() => {
                if (this.db.isClosed())
                    return callback();
            });
        } else {
            callback();
        }
    };

    drop(reconnect, callback) { //TODO: reconnect..?
        this.close(() => {
            leveldown.destroy(self.dbPath, (err) => {
                if (reconnect) {
                    return this.connect(this.dbPath, callback);
                }
                callback(err);
            });
        });
    };

    upsert(model, callback) {
        let id = this._getIndexId(model);
        this.db.put(id, model,(err) => {
            model._id = id;
            return callback(err, model);
        });
    };

    insert(model, callback) {
        let id = this._getIndexId(model);
        this.exists(id, (err, exists) => {
            if (exists)
                return callback(new Errors.DuplicateKeyError(id), id);

            this.db.put(id, model,(err) => {
                model._id = id;
                return callback(err, model);
            });
        });
    };

    update(id, model, callback) {
        this.exists(id, (err, exists) => {
            if (!exists)
                return callback(new Errors.NotFoundError(id), id);

            this.upsert(model, callback);
        });
    };

    fetch(id, callback) {
        this.db.get(id, (err, value) => {
            if (value) {
                value._id = id;
            }
            return callback(err, value);
        });
    };

    _getSearchId(id) {
        return id.split('~null')[0];
    };

    find = function (query, callback) {
        let id = this._getIndexId(query);
        let rs = this.db.createReadStream({
            gte: this._getSearchId(id),
            lte: this._getSearchId(id) + '\xff',
            fillCache: true});
        let results = [];
        rs.on('data',(data) => {
            results.push(data.value);
        });
        rs.on('close', () => { //TODO
            let query_keys = Object.keys(query);

            results = results.filter((res_item) => {
                return query_keys.every((qk) => {
                    if (Array.isArray(res_item[qk]))
                        return true; //the array was already sorted and joined, so if item has been found because of array index, it's valid

                    return query[qk] === res_item[qk];
                });
            }).map((res_item) => {
                res_item._id = this._getIndexId(res_item); //TODO take out _id so it's not written to database in all other methods
                return res_item;
            });

            callback(null, results);
        })
    };

    count(callback) {
        let rs = this.db.createReadStream();
        let count = 0;
        rs.on('data', function () {
            count++;
        });
        rs.on('close', function () {
            callback(null, count);
        })
    };

    delete(id, callback) {
        this.exists(id, (err, exists) => {
            if (!exists)
                return callback(new Errors.NotFoundError(id), id);

            this.db.del(id, function (err) {
                return callback(err, id);
            });
        });
    };

    exists(id, callback) {
        this.db.get(id, (err) => {
            callback(null, err ? false : true);
        });
    };

}
