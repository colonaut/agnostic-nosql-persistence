/**
 * Created by colonaut on 02.05.2016.
 */
const Errors = require('./../errors.js');
const Cassandra = require('cassandra-driver');


class CassandraAdapter {

    constructor(getIndexId, index_definition, options){
        this._getIndexId = getIndexId;
        this._index_definition = index_definition;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [options.host + ':' + options.port]
        });

    }


    _ensureTable(callback){
        if (!this._table_ensured){
            this._ensureKeyspace((err, keyspace) => {
                const simpleColumnType = (type) => {
                    switch(type) { //complex should be index, hu? so this is enough...
                        case 'number':
                            return 'int'; //TODO which number type (float...?)
                        default:
                            return 'text';
                    }
                }

                console.log('ensuring table', keyspace, '.', this._model_name);


                let index_definition_keys = Object.keys(this._index_definition);

                let query = "CREATE TABLE IF NOT EXISTS" + keyspace + "." + this._model_name + " ("
                    + index_definition_keys.map(col_name => {
                        let col_def = col_name + ' ';
                        let type = this._index_definition[col_name].type;
                        if (type === 'array')
                            col_def += 'set<' + simpleColumnType(this._index_definition[col_name].items[0].type) + '>'
                        else
                            col_def += simpleColumnType(type);
                        return col_def;
                    }).join(', ')
                    + ", data text) PRIMARY KEY(" +  index_definition_keys[0] + ");";

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

