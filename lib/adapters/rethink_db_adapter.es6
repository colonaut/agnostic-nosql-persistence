/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import RethinkDb from 'rethinkdb';


export default class RethinkDbAdapter {

    constructor(getIndexId, options){
        this._options = options;
        this._getIndexId = getIndexId;
        this._model_name = options.model_name;
        
    }


    get _connectOptions(){
        if (!this._connect_options){
            this._connect_options = {
                host: this._options.host,
                port: this._options.port,
                db: 'db'
            }
        }
        return this._connect_options;
    }

    get _connection(){

        if (!this._db_ensured) {
            RethinkDb.dbList()
                .contains(this._connectOptions.db)
                .do((db_exists) => {
                    return RethinkDb.branch(
                        db_exists,
                        {dbs_created: 0},
                        RethinkDb.dbCreate(this._connectOptions.db)
                    );
                }).run();
            this._db_ensured = true;
        }

        if (!this._table_ensured) {
            RethinkDb.dbList()
                .contains(this._connectOptions.db)
                .do((db_exists) => {
                    return RethinkDb.branch(
                        db_exists,
                        {dbs_created: 0},
                        RethinkDb.dbCreate(this._connectOptions.db)
                    );
                }).run();
            this._table_ensured = true;
        }


    }

    
    connect(callback) {


        if (this._conn && this._conn.open)
            return callback(null, this._conn);

        RethinkDb.connect(this._connectOptions, (err, conn) => {
            if (err)
                return callback(err);

            this._conn = conn;
            return callback(null, conn);
        });
    };

    close(reconnect, callback){ //TODO: when we do so, adapt in all adapters
        callback()
    };

    drop(recreate, callback) { //TODO: when we do so, adapt in all adapters
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
