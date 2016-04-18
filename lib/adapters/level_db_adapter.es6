/**
 * Created by colonaut on 18.04.2016.
 */
var levelup = require('levelup');
var leveldown = require('leveldown');
var _ = require('lodash');
var fs = require('fs');
var error = require('../error');
var NotFoundError = error.NotFoundError;
var DuplicateKeyError = error.DuplicateKeyError;

function LevelDbAdapter(getId) {
    var self = this;
    self.dbPath = './db';

    this.close = function(callback){
        if(self.db){
            self.db.close(function () {
                if (self.db.isClosed()) {
                    return callback();
                }
            });
        }else{
            callback();
        }
    };

    this.dropDatabase = function (reconnect, callback) {
        self.close(function(){
            leveldown.destroy(self.dbPath, function (err) {
                if (reconnect) {
                    return self.connect(self.dbPath, callback);
                }
                callback(err);
            });
        });
    };

    this.upsert = function (id, model, callback) {
        self.db.put(id, model, function (err) {
            model._id = id;
            return callback(err, model);
        });
    };

    this.insert = function (id, model, callback) {
        self.exists(id, function (err, exists) {
            if (exists) {
                return callback(new DuplicateKeyError(id), id);
            }
            self.upsert(id, model, callback);
        });
    };

    this.update = function (id, model, callback) {
        self.exists(id, function (err, exists) {
            if (!exists) {
                return callback(new NotFoundError(id), id);
            }
            self.upsert(id, model, callback);
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

    this.exists = function (id, callback) {
        self.db.get(id, function (err, value) {
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

    return this;
}

module.exports = LevelDbAdapter;
