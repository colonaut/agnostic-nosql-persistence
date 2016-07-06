/**
 * Created by colonaut on 02.05.2016.
 */
'use strict';

const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');

class CassandraAdapter {

    constructor(getIndexId, schema_analyzer, options) {
        this._getIndexId = getIndexId;
        this._schema_analyzer = schema_analyzer;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [`${options.host}:${options.port}`]
        });

    }

    _ensureIndex(callback){
        const getIndexDefinition = (col_name) => { //TODO check the right types like in create table
            if (this._schema_analyzer.value(col_name).typeOf('array'))
                return 'FULL(' + col_name + ')';
            else
                return col_name;
        }

        const createIndex = (i) => {
            let index = this._schema_analyzer.index();
            if (i >= index.length) {
                this._table_ensured = true;
                return callback(null, 'return what?');
            }

            let index_query = "CREATE INDEX IF NOT EXISTS "
                + this._model_name + "_" + index[i] + " ON "
                + this._model_name
                + " (" + getIndexDefinition(index[i]) + ");";
            console.log('->', index_query);

            this._client.execute(index_query, {}, { prepare: true }, (err) => {
                if (err)
                    return callback(err);

                createIndex(i + 1);
            });
        };

        createIndex(0);
    }

    _ensureTable(callback) {
        if (!this._table_ensured) {
            this._ensureKeySpace((err, key_space_name) => {
                if (err)
                    return callback(err);

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
                    let schema_item = this._schema_analyzer.value(col_name);
                    if (schema_item.typeOf('array')) {
                        if (this._schema_analyzer.index().indexOf(col_name) > -1)
                            col_def += 'frozen <list<' + getSimpleColumnType(schema_item.items().type()) + '>>';
                        else
                            col_def += 'list<' + getSimpleColumnType(schema_item.items().type) + '>';
                    } else {
                        col_def += getSimpleColumnType(schema_item.type());
                    }

                    return col_def;
                };

                let table_query = "CREATE TABLE IF NOT EXISTS " + this._model_name + " (partition_key text, "
                    + this._schema_analyzer.keys()
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
            callback(null, 'return what?'); //TODO return what?
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
        let columns = [];
        let values = [];

        this._schema_analyzer.values().forEach((schema_item) => {
            //console.log('_getQueryParts', schema_item.key(), schema_item.type());
            let column = schema_item.key();
            columns.push(column);
            if (schema_item.typeOf('array'))
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
/*
        let shallow_schema_details = this._getSchemaDetails().children;
        Object.keys(shallow_schema_details).forEach((col) => {
            let schema_detail = shallow_schema_details[col];
            console.log('_getQueryParts', col, schema_detail.type);
            console.log('_getQueryParts', schema_detail);
            columns.push(col);
            if (schema_detail.type === 'array') //TODO: object, list vs set ([] vs {}) and refactor (iterate schema details and get key from that object)
                values.push(
                    '[\'' + model[col].join('\', \'') + '\']'
                );
            else
                values.push(
                    schema_detail.type === 'number'
                        ? model[col]
                        : '\'' + model[col] + '\''
                );
        });
*/
        columns.unshift('partition_key');
        values.unshift('\'' + this._getIndexId(model) + '\'');

        return {
            columns: columns,
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
            " IF NOT EXISTS;";

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            console.log('->', query);
            if (err)
                return callback(err);

            model._id = this._getIndexId(model);
            if (res.first().values()[0] === false) //TODO: we _anticipate_ duplicate key error here... bt we only reveive it did not insert (but i could not see another reason ;))
                return callback(new Errors.DuplicateKeyError(model._id));

            callback(null, model);
        });
    };

    update(id, model, callback) {
        this.fetch(id, (err, existing_model) => {
            if (existing_model) {
                model._created =  existing_model._created;
                this.delete(id, () => {
                    this.insert(model, (err, res) => {
                        return callback(null, res);
                    })
                });
            } else
                return callback(new Errors.NotFoundError(id));
        });
    };

    fetch(id, callback) {
        let query = "SELECT * FROM " + this._model_name + " WHERE partition_key = '" + id + "';";
        //console.log('->', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
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

    find(query, callback) {
        callback()
    };

    count(callback) {
        let query = "SELECT count(*) FROM " + this._model_name +";";
        //console.log('<-', query);

        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            callback(null, parseInt(res.first().values()[0]));
        });
    };

    delete(id, callback) {
        let query = "DELETE FROM " + this._model_name + " WHERE partition_key = '" + id + "';";
        //console.log('->', query);
        this._client.execute(query, {}, {prepare: true}, (err, res) => {
            if (err)
                return callback(err);

            return callback(null, id);
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

