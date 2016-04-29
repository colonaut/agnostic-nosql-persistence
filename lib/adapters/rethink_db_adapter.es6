/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import RethinkDb from 'rethinkdb';


export default class RethinkDbAdapter {

    constructor(getIndexId, index, options){
        this._getIndexId = getIndexId;
        this._index = index;
        this._options = options;
        this._model_name = options.model_name;
    }

    _ensureIndex(conn, callback){
        let db_name = this._options.db;
        let table_name = this._model_name;
        if (!this._index_ensured){//TODO: better try compound index than for-each (plus index on array)
            let table = RethinkDb.db(db_name).table(table_name);
            for (let index_name of this._index) {
                table.indexList()
                    .contains(index_name).do(RethinkDb.branch(RethinkDb.row, table, RethinkDb.do(() => {
                    return table.indexCreate(index_name, {}).do(() => {
                        return table;
                    });
                }))).run(conn, (err) => {
                    if (err)
                        return callback(err);
                });
            }
            table.indexWait().run(conn, (err, result) => {
                if (err)
                    return callback(err);

                this._index_ensured = true;
                console.log(result);
                return callback(null);
            });
        } else {
            callback(null);
        }
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
                    this._ensureIndex(conn, (err) => {
                        if (err)
                            return callback(err);

                        return callback(null);
                    });
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

                        return callback(null);
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

    drop(callback) { //TODO: implement recreate?, adapt in all adapters
        RethinkDb.tableDrop(this._model_name).run(this._conn, (err) => {
            if (err)
                return callback(err);

            this._table_ensured = false;
            this._ensureTable(this._conn, (err) => {
                if (err)
                    return callback(err);

                callback(null);
            });
        });
    };

    upsert(model, callback) {
        callback()
    };

    insert(model, callback) {
        //model.id = this._getIndexId(model);
        RethinkDb.table(this._model_name).insert(model).run(this._conn, (err, result) => {
            if (err)
                return callback(err);

            model.id = result.generated_keys[0];
            callback(null, model);
        });
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
