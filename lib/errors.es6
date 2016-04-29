/**
 * Created by kalle on 04.04.2016.
 */

export class NotFoundError extends Error {
    constructor(id){
        super(id);

        this.name = 'NotFoundError';
        this.message = '"' + id + '" does not exist';
    }
}

export class DuplicateKeyError extends Error {
    constructor(id){
        super(id);

        this.name = 'DuplicateKeyError';
        this.message = '"' + id + '" already exists';
    }
}

export class NotImplementedError extends Error {
    constructor(method_name, adapter){
        super(method_name);

        this.name = 'NotImplementedError';
        this.message = '"' + method_name + '" not implemented in "' + adapter.constructor.name + '"';
    }
}

export class NotConnectedError extends Error {
    constructor(host, port){
        super(host, port);

        this.name = 'NotConnectedError';
        this.message = 'Not connected to ' + host + ':' + port;
    }
}