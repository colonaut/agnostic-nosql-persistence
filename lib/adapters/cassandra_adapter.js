/**
 * Created by colonaut on 02.05.2016.
 */
const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');


class CassandraAdapter {

    constructor(getIndexId, schema_definition, options){
        this._getIndexId = getIndexId;
        this._schema_definition = schema_definition;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [options.host + ':' + options.port]
        });

    }


    _ensureTable(callback){
        if (!this._table_ensured){
            this._ensureKeyspace((err, keyspace) => {
                console.log('ensuring table', keyspace, '.', this._model_name);
                const simpleColumnType = (type) => {
                    switch(type) { //TODO: datetime
                        case 'number':
                            return 'float'; //TODO which number type (float...?)
                        default:
                            return 'text';
                    }
                }

                let schema_keys = Object.keys(this._schema_definition);
                let query = "CREATE TABLE IF NOT EXISTS " + keyspace + "." + this._model_name + " ("
                    + schema_keys.map(col_name => {
                            let col_def = col_name + ' ';
                            let schema_def = this._schema_definition[col_name];
                            if (schema_def.type === 'array') {
                                if (schema_def.index)
                                    col_def += 'frozen ';
                                col_def += 'list<' + simpleColumnType(schema_def.items[0].type) + '>'
                            } else {
                                col_def += simpleColumnType(schema_def.type);
                            }
                            return col_def;
                        }).join(', ')
                    + ") PRIMARY KEY(" + schema_keys.filter(sk => this._schema_definition[sk].index).join(', ') + ");";

                    console.log(query);

                this._table_ensured = true;
                callback(null, 'return what?');
            });
        } else {
            callback(null, 'return what?');
        }
    }

    _ensureKeyspace(callback){
        if (!this._keyspace_ensured){
            console.log('ensuring keyspace', this._options.db);
            let query = "CREATE KEYSPACE IF NOT EXISTS " + this._options.db
                + " WITH REPLICATION = { 'class': 'SimpleStrategy', 'replication_factor': 1 };";

            this._client.execute(query, {}, { prepare: true }, (err) => {
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
                callback(err, this._client);
            });
        });
    };

    close(callback){ //TODO: implement reconnect?, adapt in all adapters, if. But I can't see a usage reason...
        this._client.shutdown(callback);
    };

    drop(callback) { //TODO: implement recreate!, adapt in all adapters
        callback();
    };

    upsert(model, callback) {
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

