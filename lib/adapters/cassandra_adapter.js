/**
 * Created by colonaut on 02.05.2016.
 */
'use strict';

const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');

class CassandraAdapter {

    constructor(getIndexId, getSchemaDetails, options) { //TODO pass a function schema definition. that's better
        this._getIndexId = getIndexId;
        this._getSchemaDetails = getSchemaDetails;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [`${options.host}:${options.port}`]
        });

    }

    _ensureIndex(callback){
        let shallow_schema_details = this._getSchemaDetails().children;
        let index = this._getSchemaDetails().index;

        const getIndexDefinition = (col_name) => {
            let schema_detail = shallow_schema_details[col_name];
            if (schema_detail.type === 'array')
                return 'FULL(' + col_name + ')';
            else
                return col_name;
        }

        const createIndex = (i) => {
            if (i >= index.length) {
                this._table_ensured = true;
                return callback(null, 'return what?');
            }

            let index_query = "CREATE INDEX IF NOT EXISTS "
                + this._model_name + "_" + index[i] + " ON "
                + this._model_name
                + " (" + getIndexDefinition(index[i]) + ");";
            console.log('->', index_query);

            this._client.execute(index_query, {}, { prepare: true }, (err, res) => {
                if (err)
                    return callback(err);

                createIndex(i + 1);
            });
        };

        createIndex(0);
    }

    _ensureTable(callback) {
        if (!this._table_ensured) {
            this._ensureKeySpace((err, key_space) => {
                if (err)
                    return callback(err);

                let shallow_schema_details = this._getSchemaDetails().children;
                let index = this._getSchemaDetails().index;

                const getSimpleColumnType = (schema_type) => {
                    switch (schema_type) { //TODO: date (->timestamp), object (->map)
                        case 'number':
                            return 'float'; //TODO which number type (float...?)
                        default:
                            return 'text';
                    }
                }; //TODO: refactor
                const getColumnDefinition = (col_name) => {
                    let col_def = col_name + ' ';
                    let schema_detail = shallow_schema_details[col_name];
                    if (schema_detail.type === 'array') {
                        if (index.indexOf(col_name) > -1)
                            col_def += 'frozen <list<' + getSimpleColumnType(schema_detail.items[0].type) + '>>';
                        else
                            col_def += 'list<' + getSimpleColumnType(schema_detail.items[0].type) + '>';
                    } else {
                        col_def += getSimpleColumnType(schema_detail.type);
                    }

                    return col_def;
                };

                //let sorted_schema_keys = [].concat('partition_key', index, Object.keys(shallow_schema_details).filter(i => !index.find(n => n === i)));
                let table_query = "CREATE TABLE IF NOT EXISTS " + this._model_name + " (partition_key text, "
                    + Object.keys(shallow_schema_details)
                        .map(col_name => getColumnDefinition(col_name))
                        .join(', ')
                    + ", PRIMARY KEY(partition_key));";
                console.log('->', table_query);

                this._client.execute(table_query, {}, {prepare: true}, (err) => {
                    if (err)
                        return callback(err);

                    this._ensureIndex(callback);
                });
            });
        } else {
            callback(null, 'return what?');
        }
    }

    _ensureKeySpace(callback) {
        if (!this._keyspace_ensured) {
            let query = "CREATE KEYSPACE IF NOT EXISTS " + this._options.db
                + " WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 };";

            this._client.execute(query, {}, {prepare: true}, (err) => {
                if (err)
                    return callback(err);

                this._client.execute("USE " + this._options.db, (err) => {
                    if (err)
                        return callback(err);

                    this._keyspace_ensured = true;
                    callback(null, this._client.keyspace);
                });
            });
        } else {
            callback(null, this._client.keyspace);
        }
    }

    _getQueryParts(model){
        let cols = [];
        let values = [];
        let shallow_schema_details = this._getSchemaDetails().children;
        Object.keys(shallow_schema_details).forEach((col) => {
            cols.push(col);
            if (shallow_schema_details[col].type === 'array') //TODO: object, list vs set ([] vs {}) and refactor (iterate schema details and get key from that object)
                values.push('[\'' + model[col].join('\', \'') + '\']');
            else
                values.push('\'' + model[col] + '\'');
        });

        cols.unshift('partition_key');
        values.unshift('\'' + this._getIndexId(model) + '\'');

        return {
            columns: cols,
            values: values
        };
    }


    connect(callback) {
        if (this._client.connected)
            return callback(null, this._client);

        this._client.connect((err) => {
            if (err)
                return callback(err);

            this._ensureTable((err) => {
                if (err)
                    return callback(err);

                callback(null, this._client);
            });
        });
    };

    close(callback) { //TODO: implement reconnect?, adapt in all adapters, if. But I can't see a usage reason...
        this._client.shutdown(callback);
    };

    drop(recreate, callback) { //TODO: implement recreate!, adapt in all adapters (we need it here, as table is gone! for tests an immediate recreation is neccessary)
        if (typeof recreate === 'function') {
            callback = recreate;
            recreate = false;
        }

        let table_query = "DROP TABLE IF EXISTS " + this._model_name;
        console.log('<-', table_query);

        this._client.execute(table_query, {}, {prepare: true}, (err) => {
            if (err)
                return callback(err);

            this._table_ensured = false;
            if (recreate) {
               this._ensureTable((err) => {
                   if (err)
                       return callback();

                   callback();
               });
            } else {
                callback();
            }
        });
    };

    upsert(model, callback) {
        let query_parts = this._getQueryParts(model);
        let query = "INSERT INTO " + this._model_name +
            " (" + query_parts.columns.join(', ') + ")" +
            " VALUES (" + query_parts.values.join(', ') + ");";
        //console.log('->', query);

        this._client.execute(query, {}, {prepare: true}, (err) => {
            if (err)
                return callback(err);

            model._id = this._getIndexId(model);
            callback(null, model);
        });

    };

    insert(model, callback) {
        let query_parts = this._getQueryParts(model);
        let query = "INSERT INTO " + this._model_name +
            " (" + query_parts.columns.join(', ') + ")" +
            " VALUES (" + query_parts.values.join(', ') + ")" +
            //";";
            " IF NOT EXISTS;";
        //console.log('->', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            model._id = this._getIndexId(model);
            if (res.first().values()[0] === false) //TODO: we _anticipate_ duplicate key error here... bt we only reveive it did not insert (but i could not see another reason ;))
                return callback(new Errors.DuplicateKeyError(model._id));

            callback(null, model);
        });
    };

    update(id, model, callback) {
        callback()
    };

    fetch(id, callback) {
        let query = "SELECT * FROM " + this._model_name + " WHERE partition_key = '" + id + "';";
        console.log('->', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            console.error('fetch', err);
            console.log('fetch', res);

            if (err)
                return callback(err);

            callback(null, true);
        });
    };

    find(query, callback) {
        callback()
    };

    count(callback) {
        callback()
    };

    delete(id, callback) {
        let query = "DELETE FROM " + this._model_name + " WHERE partition_key = '" + id + "';";
        console.log('->', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            console.error('delete', err);
            console.log('delete', res);

            if (err)
                return callback(err);

            callback(null, true);
        });
    };

    exists(id, callback) {
        let query = "SELECT count(*) FROM " + this._model_name + " WHERE partition_key = '" + id + "';";
        //console.log('<-', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            callback(null, parseInt(res.first().values()[0]) > 0);
        });

    };
};

module.exports = CassandraAdapter;

