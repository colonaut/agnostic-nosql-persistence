/**
 * Created by colonaut on 02.05.2016.
 */
'use strict';

const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');
const Async = require('async');

const CassandraAdapter = function (getIndexId, schema_analyzer, options) {
    options = options || {};
    const db_name = options.db;
    const model_name = options.model_name;
    /*const client = new Cassandra.Client({
     contactPoints: [`${options.host}:${options.port}`]
     });*/

    let client, keyspace, table;

    const getIndexDefinition = (col_name) => { //TODO check the right types like in create table
        if (schema_analyzer.value(col_name).typeOf('array'))
            return 'FULL(' + col_name + ')';
        else
            return col_name;
    };

    const getQueryParts = (model) => {
        let columns = [];
        let values = [];

        schema_analyzer.values().forEach((schema_item) => {
            //console.log('_getQueryParts', schema_item.key(), schema_item.type());
            let column = schema_item.key();
            columns.push(column);
            if (schema_item.typeOf('array')) //TODO: object, list vs set ([] vs {}) and refactor (iterate schema details and get key from that object)
                values.push(
                    '[\'' + model[column].join('\', \'') + '\']'
                );
            else
                values.push(
                    schema_item.typeOf('number')
                        ? model[column]
                        : '\'' + model[column] + '\''
                );
        });

        columns.unshift('partition_key');
        values.unshift('\'' + getIndexId(model) + '\'');

        return {
            columns: columns,
            values: values
        };
    };

    const ensureIndex = () => {
        return new Promise((resolve, reject) => {
            let t = new Date().getTime();

            Async.every(schema_analyzer.index(), (index_item, callback) => {
                let index_query = "CREATE INDEX IF NOT EXISTS "
                    + table + "_" + index_item + " ON "
                    + table
                    + " (" + getIndexDefinition(index_item) + ");";
                console.log('->', index_query);

                client.execute(index_query, {}, {prepare: true}, callback);
            }, (err) => {
                if (err)
                    return reject(err)

                console.log('--> T:', new Date().getTime() - t);
                return resolve();
            });
        });
    };

    const ensureTable = () => {
        return new Promise((resolve, reject) => {
            if (table)
                return resolve();

            let t = new Date().getTime();


            const getSimpleColumnType = (schema_type) => {
                switch (schema_type) { //TODO: date (->timestamp), object (->map)
                    case 'number':
                        return 'float'; //TODO which number type (float...? implement schema precisions!)
                    default:
                        return 'text';
                }
            };

            const getColumnDefinition = (col_name) => {
                let col_def = col_name + ' ';
                let schema_item = schema_analyzer.value(col_name);
                if (schema_item.typeOf('array')) {
                    if (schema_analyzer.index().indexOf(col_name) > -1)
                        col_def += 'frozen <list<' + getSimpleColumnType(schema_item.items().type()) + '>>';
                    else
                        col_def += 'list<' + getSimpleColumnType(schema_item.items().type) + '>';
                } else {
                    col_def += getSimpleColumnType(schema_item.type());
                }

                return col_def;
            };

            let table_query = "CREATE TABLE IF NOT EXISTS " + model_name + " (partition_key text, "
                + schema_analyzer.keys()
                    .map(col_name => getColumnDefinition(col_name))
                    .join(', ')
                + ", PRIMARY KEY(partition_key));";
            console.log('->', table_query);

            client.execute(table_query, {}, {prepare: true}, (err) => {
                if (err)
                    return reject(err);

                console.log('--> T:', new Date().getTime() - t);
                t = new Date().getTime();

                table = model_name;
                return resolve();
            });
        });
    };

    const ensureKeySpace = () => {
        return new Promise((resolve, reject) => {
            if (keyspace)
                return resolve();

            let t = new Date().getTime();

            let query = "CREATE KEYSPACE IF NOT EXISTS "
                + db_name
                + " WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 };";
            console.log('->', query);

            client.execute(query, {}, {prepare: true}, (err, result) => {
                if (err)
                    return reject(err);

                client.execute("USE " + options.db, (err) => {
                    if (err)
                        return reject(err);

                    console.log('--> T:', new Date().getTime() - t);

                    keyspace = client.keyspace;
                    return resolve();
                });
            });
        });
    };

    const connect = () => {
        return new Promise((resolve, reject) => {
            if (!client) {
                client = new Cassandra.Client({
                    contactPoints: [`${options.host}:${options.port}`]
                });
            }

            if (client.connected)
                return resolve(client);

            client.connect((err) => {
                if (err)
                    reject(err);

                return resolve();
            });
        });
    };


    this.connect = (callback) => {
        connect()
            .then(() => ensureKeySpace())
            .then(() => ensureTable())
            .then(() => ensureIndex())
            .then(() => {
                return callback(null, client);
            })
            .catch((err) => {
                console.log('err:', err);
                return callback(err);
            });
    };

    this.close = (callback) => { //TODO: implement reconnect?, adapt in all adapters, if. But I can't see a usage reason...
        client.shutdown(callback);
    };

    this.drop = (recreate, callback) => {
        let table_query = "DROP KEYSPACE IF EXISTS " + keyspace;
        console.log('<-', table_query);
        let t = new Date().getTime();

        client.execute(table_query, {}, {prepare: true}, (err) => {
            if (err)
                return callback(err);

            console.log('--> T:', new Date().getTime() - t);
            keyspace = table = undefined;

            if (!recreate)
                return callback();

            connect()
                .then(() => ensureKeySpace())
                .then(() => ensureTable())
                .then(() => ensureIndex())
                .then(() => {
                    return callback(null, client);
                })
                .catch((err) => {
                    console.log('err:', err);
                    return callback(err);
                });
        });
    };

    this.upsert = (model, callback) => {
        let query_parts = this._getQueryParts(model);
        let query = "INSERT INTO " + model_name +
            " (" + query_parts.columns.join(', ') + ")" +
            " VALUES (" + query_parts.values.join(', ') + ");";
        //console.log('->', query);

        client.execute(query, {}, {prepare: true}, (err) => {
            if (err)
                return callback(err);

            model._id = getIndexId(model);
            callback(null, model);
        });

    };

    this.insert = (model, callback) => {
        let query_parts = getQueryParts(model);
        let query = "INSERT INTO " + model_name +
            " (" + query_parts.columns.join(', ') + ")" +
            " VALUES (" + query_parts.values.join(', ') + ")" +
            " IF NOT EXISTS;";

        client.execute(query, {}, {prepare: true}, (err, res) => {
            console.log('->', query);
            if (err)
                return callback(err);

            model._id = getIndexId(model);
            if (res.first().values()[0] === false) //TODO: we _anticipate_ duplicate key error here... bt we only reveive it did not insert (but i could not see another reason ;))
                return callback(new Errors.DuplicateKeyError(model._id));

            callback(null, model);
        });
    };

    this.update = (id, model, callback) => {
        this.fetch(id, (err, existing_model) => {
            if (existing_model) {
                model._created = existing_model._created;
                this.delete(id, () => {
                    this.insert(model, (err, res) => {
                        return callback(null, res);
                    })
                });
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    this.fetch = (id, callback) => {
        let query = "SELECT * FROM " + model_name + " WHERE partition_key = '" + id + "';";
        //console.log('->', query);

        client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            let row = res.first();
            if (!row)
                return callback();

            let model = Object.assign({
                _id: row.values()[0]
            }, row);
            delete model['partition_key'];
            callback(null, model);
        });
    };

    this.find = (query, callback) => {
        callback()
    };

    this.count = (callback) => {
        let query = "SELECT count(*) FROM " + model_name + ";";
        //console.log('<-', query);

        client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            callback(null, parseInt(res.first().values()[0]));
        });
    };

    this.delete = (id, callback) => {
        let query = "DELETE FROM " + model_name + " WHERE partition_key = '" + id + "';";
        //console.log('->', query);
        client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            return callback(null, id);
        });
    };

    this.exists = (id, callback) => {
        let query = "SELECT count(*) FROM " + model_name + " WHERE partition_key = '" + id + "';";
        //console.log('<-', query);

        client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            callback(null, parseInt(res.first().values()[0]) > 0);
        });

    };
};

module.exports = CassandraAdapter;

