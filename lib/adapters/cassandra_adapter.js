/**
 * Created by colonaut on 02.05.2016.
 */
const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');


class CassandraAdapter {

    constructor(getIndexId, getSchemaDetails, options) { //TODO pass a function schema definition. that's better
        this._getIndexId = getIndexId;
        this._getSchemaDetails = getSchemaDetails;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [options.host + ':' + options.port]
        });

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
                };
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

                let table_query = "CREATE TABLE IF NOT EXISTS " + this._model_name + " ("
                    + Object.keys(shallow_schema_details)
                        .map(col_name => getColumnDefinition(col_name))
                        .join(', ')
                    + ", PRIMARY KEY(" + index.join(', ') + "));";
                console.log('->', table_query);

                this._client.execute(table_query, {}, {prepare: true}, (err) => {
                    if (err)
                        return callback(err);

                    const createIndex = (i) => {
                        if (i >= index.length) {
                            this._table_ensured = true;
                            return callback(null, 'return what?');
                        }

                        let index_query = "CREATE INDEX IF NOT EXISTS "
                            + this._model_name + "_" + index[i] + " ON "
                            + this._model_name
                            + " (FULL(" + index[i] + "));"
                        console.log('->', index_query);

                        this._client.execute(index_query, {}, { prepare: true }, (err, res) => {
                            if (err)
                                return callback(err);

                            createIndex(i + 1);
                        });
                    };
                    createIndex(1);
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
        callback = typeof callback === 'function' ? callback : recreate;
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

        let cols = [];
        let values = [];
        Object.keys(this._getSchemaDetails().children).forEach((col) => {
            cols.push(col);
            values.push(model[col]);
        });

        console.log(cols.join(', '), values.join(', '));

        /*
         INSERT INTO playlists (id, song_order, song_id, title, artist, album)
         VALUES (62c36092-82a1-3a00-93d1-46196ee77204, 1,
         a3e64f8f-bd44-4f28-b8d9-6938726e34d4, 'La Grange', 'ZZ Top', 'Tres Hombres');
        */

        let query = "";

        callback()
    };

    insert(model, callback) {
        callback();
    };

    update(id, model, callback) {
        callback()
    };

    fetch(id, callback) {
        callback()
    };

    find(query, callback) {
        callback()
    };

    count(callback) {
        callback()
    };

    delete(id, callback) {
        callback()
    };

    exists(id, callback) {
        callback()
    };

}

module.exports = CassandraAdapter;

