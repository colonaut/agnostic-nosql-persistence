/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import RethinkDb from 'rethinkdb';


export default class RethinkDbAdapter {

    constructor(getIndexId, options){
        this._options = options;
        this._getIndexId = getIndexId;

    }


    get _connectOptions(){
        if (!this._connect_options){
            this._connect_options = {
                host: this._options.host,
                port: this._options.port,
                db: this._options.db_name
            }
        }

        return this._connect_options;
    }

    
    connect(callback) {
        RethinkDb.connect(this._connectOptions, (err, connection) => {
            if (!err) {
                this._conn = connection;
                return callback();
            } else {
                callback(err);
            }
        })
    };

    close(callback){
        callback()
    };

    drop(reconnect, callback) { //TODO: reconnect..?
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
