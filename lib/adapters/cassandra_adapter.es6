/**
 * Created by colonaut on 02.05.2016.
 */
const Errors = require('./../errors.es6');
const Cassandra = require('cassandra-driver');


class CassandraAdapter {

    constructor(getIndexId, index, options){
        this._getIndexId = getIndexId;
        this._index = index;
        this._options = options;
        this._model_name = options.model_name;

        this._client = new Cassandra.Client({
            contactPoints: [options.host + ':' + options.port]
        });

    }


    _ensureKeyspace(callback){
        if (!this._keyspace_ensured){
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

            this._ensureKeyspace((err) => {
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

