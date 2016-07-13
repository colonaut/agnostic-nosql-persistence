/**
 * Created by colonaut on 18.04.2016.
 */
const Errors = require('./../errors.js');
const levelup = require('levelup');
const MemDOWN = require('memdown');


const LevelDbAdapter = function (getIndexKey, schema_details, options) {
    options = options || {};
    const model_name = options.model_name;
    const db_name = options.db || 'anp_default';

    let data_base;

    this.connect = (callback) => {
        if (data_base && data_base.isOpen())
            return callback(null, data_base);

        data_base = levelup(model_name, {
            db: MemDOWN,
            valueEncoding: 'json',
            keyEncoding: 'json'
        });

        data_base.on('ready', (err) => {
            if (err)
                callback(err);

            return callback(null, data_base);
        });
    };

    this.close = (callback) => {
        if (data_base) {
            data_base.close(() => {
                if (data_base.isClosed())
                    return callback();
            });
        } else {
            callback();
        }
    };

    this.drop = (reconnect, callback) => { //TODO: reconnect..?
        this.close(() => {
            data_base.destroy(model_name, (err) => {
                if (err)
                    return callback(err);

                if (reconnect)
                    return this.connect(callback);

                callback();
            });
        });
    };

    this.upsert = (model, callback) => {
        let id = getIndexKey(model);
        data_base.put(id, model, (err) => {
            model._id = id;
            return callback(err, model);
        });
    };

    this.insert = (model, callback) => {
        let id = getIndexKey(model);
        this.exists(id, (err, exists) => {
            if (exists)
                return callback(new Errors.DuplicateKeyError(id), id);

            data_base.put(id, model, (err) => {
                model._id = id;
                return callback(err, model);
            });
        });
    };

    this.update = (id, model, callback) => {
        this.exists(id, (err, exists) => {
            if (!exists)
                return callback(new Errors.NotFoundError(id), id);

            this.upsert(model, callback);
        });
    };

    this.fetch = (id, callback) => {
        data_base.get(id, (err, value) => {
            if (value) {
                value._id = id;
            }
            return callback(err, value);
        });
    };

    const getSearchId = (id) => {
        return id.split('~null')[0];
    };

    this.find = (query, callback) => {
        let id = getIndexKey(query);
        let rs = data_base.createReadStream({
            gte: getSearchId(id),
            lte: getSearchId(id) + '\xff',
            fillCache: true
        });
        let results = [];
        rs.on('data', (data) => {
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
                res_item._id = getIndexKey(res_item); //TODO take out _id so it's not written to database in all other methods
                return res_item;
            });

            callback(null, results);
        })
    };

    this.count = (callback) => {
        let rs = data_base.createReadStream();
        let count = 0;
        rs.on('data', function () {
            count++;
        });
        rs.on('close', function () {
            callback(null, count);
        });
    };

    this.delete = (id, callback) => {
        this.exists(id, (err, exists) => {
            if (!exists)
                return callback(new Errors.NotFoundError(id), id);

            data_base.del(id, function (err) {
                return callback(err, id);
            });
        });
    };

    this.exists = (id, callback) => {
        data_base.get(id, (err) => {
            callback(null, err ? false : true);
        });
    };
};

module.exports = LevelDbAdapter;