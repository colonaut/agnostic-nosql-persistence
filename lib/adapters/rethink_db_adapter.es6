/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import RethinkDb from 'rethinkdb';


export default class RethinkDbAdapter {

    constructor(getIndexId, options){
        this._options = Object.assign({db: 'anp_default'}, options);
        this._getIndexId = getIndexId;
        this._model_name = options.model_name;
        
    }


    _ensureTable(conn, callback){
        let db_name = this._options.db;
        let table_name = this._model_name;
        if (!this._table_ensured) {
            let table = RethinkDb.db(db_name).table(table_name);
            RethinkDb.db(db_name).tableList()
                .contains(table_name)
                .do(RethinkDb.branch(RethinkDb.row, table, RethinkDb.do(() => {
                    return RethinkDb.db(db_name).tableCreate(table_name, {}).do(() => { //TODO: table options
                        return table;
                    });
                }))).run(conn, (err) => {
                    if (err)
                        return callback(err);

                    this._table_ensured = true;
                    callback(null);
                });
        } else {
            callback(null);
        }
    }

    _ensureDb(conn, callback){
        let db_name = this._options.db;
        if (!this._db_ensured) {
            RethinkDb.dbList()
                .contains(db_name)
                .do((db_exists) => {
                    return RethinkDb.branch(
                        db_exists,
                        {dbs_created: 0},
                        RethinkDb.dbCreate(db_name)
                    );
                }).run(conn, (err) =>{
                    if (err)
                        return callback(err);

                    this._db_ensured = true;
                    this._ensureTable(conn, (err) => {
                        if (err)
                            return callback(err);

                        callback(null);
                    });
                });
        } else {
            callback(null);
        }
    }

    
    connect(callback) {
        if (this._conn && this._conn.open)
            return callback(null, this._conn);

        RethinkDb.connect(this._options, (err, conn) => {
            if (err)
                return callback(err);

            this._ensureDb(conn, (err) => {
                if (err)
                    return callback(err);

                this._conn = conn;
                return callback(null, conn);
            });
        });
    };

    close(callback){ //TODO: implement reconnect?, adapt in all adapters, if. But I can't see a usage reason...
        if (this._conn && this._conn.open)
            return this._conn.close(callback);

        callback(null);
    };

    drop(recreate, callback) { //TODO: implement recreate, adapt in all adapters
        callback()
    };

    upsert(model, callback) {
        callback()
    };

    insert(model, callback) {
        callback()
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
