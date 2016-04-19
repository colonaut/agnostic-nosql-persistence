/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import levelup from 'levelup';
import leveldown from 'leveldown';
import fs from 'fs';


export default class LevelDbAdapter {

    constructor(getIndexId, model_name){
        this._model_name = model_name || 'default';
        this._getIndexId = getIndexId;
    }

    var self = this;
    self.dbPath = './db';

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

    this.findById = function (id, callback) {
        self.db.get(id, function (err, value) {
            if (value) {
                value._id = id;
            }
            return callback(err, value);
        });
    };

    var getSearchId = function (id) {
        return id.split('~null')[0];
    };

    this.find = function (query, id, callback) {
        var rs = self.db.createReadStream({gte: getSearchId(id), lte: getSearchId(id) + '\xff', fillCache: true});
        var results = [];
        rs.on('data', function (data) {
            results.push(data.value);
        });
        rs.on('close', function () {
            var filtered = _.map(_.filter(results, query), function (item) {
                item._id = getId(item);
                return item;
            });
            callback(null, filtered);
        })
    };

    this.count = function (callback) {
        var rs = self.db.createReadStream();
        var count = 0;
        rs.on('data', function () {
            count++;
        });
        rs.on('close', function () {
            callback(null, count);
        })
    };

    this.deleteById = function (id, callback) {
        self.exists(id, function (err, exists) {
            if (!exists) {
                return callback(new NotFoundError(id), id);
            }
            self.db.del(id, function (err) {
                return callback(err, id);
            });
        });
    };

    exists(id, callback) {
        this.db.get(id, function (err, value) {
            callback(null, err ? false : true);
        });
    };

    this.connect = function (uri, callback) {
        if(uri && uri !== ''){
            self.dbPath = uri;
        }

        if (self.db && self.db.isOpen()) {
            return callback();
        }

        self.db = levelup(self.dbPath, {
            valueEncoding: 'json',
            keyEncoding: 'json'
        });
        self.db.on('ready', function (err) {
            return callback();
        });
    };


}
