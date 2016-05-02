/**
 * Created by colonaut on 02.05.2016.
 */
import * as Errors from './../errors';
import Cassandra from 'cassandra-driver';


export default class CassandraAdapter {

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

            this._client.execute(query, {}, { prepare: true }, (err, res) => {
                if (err)
                    return callback(err);

                this._keyspace_ensured = true;
                callback(null, res);
            });
        } else {
            callback(null);
        }
    }


    connect(callback) {
        this._client.connect((err, res) => {
            if (err)
                return callback(err);

            this._ensureKeyspace((err) => {
                callback(err, res);
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

