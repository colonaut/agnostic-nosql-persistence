/**
 * Created by colonaut on 18.04.2016.
 */
import * as Errors from './../errors';
import levelup from 'levelup';
import leveldown from 'leveldown';


export default class RethinkDbAdapter {

    constructor(getIndexId, model_name){
        this._model_name = model_name || 'default';
        this._getIndexId = getIndexId;

    }

    connect(uri, callback) {
        callback()
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

    find = function (query, callback) {
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
