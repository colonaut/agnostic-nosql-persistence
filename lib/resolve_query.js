'use strict';
const blocked = require('blocked');
blocked(function (ms) {
    console.error('"Query" event loop was BLOCKED FOR %sms', ms | 0);
}, {threshold: 1});

//TODO async! use callback! (or promises..)
const eql = (query_value, value, callback) => callback(null, query_value === value);
const lt = (query_value, value, callback) => callback(null, query_value < value);
const gt = (query_value, value, callback) => callback(null, query_value > value);
const lte = (query_value, value, callback) => callback(null, query_value <= value);
const gte = (query_value, value, callback) => callback(null, query_value >= value);
const left = (query_value, value, callback) => callback(null, value.startsWith(query_value));
const right = (query_value, value, callback) => callback(null, value.endsWith(query_value));
const inner = (query_value, value, callback) => callback(null, value.indexOf(query_value) > -1);
const arrayIncludes = (query_value, value, callback) => {
    value = [].concat(value);
    for (let qv of query_value) {
        if (!value.includes(qv))
            return callback(null, false);
    }

    return callback(null, true);
};

/**
 * !FOR ADAPTER DEVELOPERS ONLY!
 * @param {Object} query_data Result of the factory method
 * @param {Array.<string>} keys
 * @constructor
 */
const ResolvedQuery = function (query_data, keys) {
    //TODO determinie if it is an indexed query OR directly throw if not
    //TODO: getIndexId should go in here? (then pass only schema analyzer and query analyzer into adapters) -> probably not so good idea
    //TODO: but index search should be provides a function here?

    /**
     *
     * @param key {string}
     * @returns {boolean}
     */
    this.isNumber = (key) => !!query_data[key].is_number;

    /**
     *
     * @param key {string}
     * @returns {boolean}
     */
    this.isArray = (key) => !!query_data[key].is_array;

    /**
     *
     * @param {object} model
     * @param {function} callback
     * @returns {boolean}
     */
    this.match = (model, callback) => {

        //TODO better generators and yield, or events... not synchronizing !
        const recursive = (count) => {
            count = count || 0;
            let key = keys[count];

            if (!model[key])
                return callback(new Error(`Key mismatch: model does not contain key "${key}"`), false);

            if (typeof query_data[key].match !== 'function')
                return callback(new Error(`Query could not find match function for key "${key}"`), false);

            query_data[key].match(model[key], (err, res) => {
                if (count === keys.length - 1)
                    return callback(err, res);

                if (!res || err)
                    return callback(err, res);

                recursive(count + 1);
            });
        };
        recursive();
    };

    /**
     *
     * @returns {Array} The keys of the query
     */
    this.keys = () => keys; //TODO: should only reflect keys that are part of the index!

    /**
     *
     * @param key
     * @returns {Array|String|Number} The given query pattern for key
     */
    this.value = (key) => query_data[key].value;

    /**
     *
     * @param key
     * @returns {string} expression
     */
    this.expr = (key) => query_data[key].expression;

};


module.exports = function(query, schema_analyzer) {
    return new Promise((resolve, reject) => {
        //TODO: schema_analyzer must always return true for typeOf number, if it is a number!
        //TODO: schema_analyzer must return an empty array, if no index is given
        const keys = Object.keys(query);//.filter(k => schema_analyzer.index().includes(k));
        const result = {};
        for (let key of keys) {
            if (!schema_analyzer.index().includes(key))
                reject(new Error(`Invalid query: ${key} is not part of index.`));

            let key_res = result[key] = {};
            let query_value = query[key];
            if (schema_analyzer.value(key).typeOf('string')) {
                //TODO: escaping **
                let qv = query_value.trim();
                if (qv.endsWith('*')) {
                    if (qv.startsWith('*'))
                        key_res.match = inner.bind(this, qv.substring(1, qv.length));
                    else
                        key_res.match = left.bind(this, qv.substring(0, qv.length - 1));

                    key_res.expression = qv;
                } else if (qv.startsWith('*')) {
                    key_res.match = right.bind(this, qv.substring(1, qv.length));
                    key_res.expression = qv;
                } else {
                    key_res.match = eql.bind(this, query_value);
                    key_res.value = query_value;
                }
            } else if (schema_analyzer.value(key).typeOf('number')) {
                switch (typeof query_value) {
                    case 'number':
                        key_res.is_number = true;
                        key_res.value = Number(query_value);
                        key_res.match = eql.bind(this, Number(query_value));
                        break;
                    case 'string':
                        key_res.is_number = true;
                        key_res.expression = query_value = query_value.trim();
                        if (query_value.startsWith('<='))
                            key_res.match = lte.bind(this, Number(query_value.substring(2, query_value.length)));
                        else if (query_value.startsWith('>='))
                            key_res.match = gte.bind(this, Number(query_value.substring(2, query_value.length)));
                        else if (query_value.startsWith('<'))
                            key_res.match = lt.bind(this, Number(query_value.substring(1, query_value.length)));
                        else if (query_value.startsWith('>'))
                            key_res.match = gt.bind(this, Number(query_value.substring(1, query_value.length)));
                        break;
                    default:
                        //key_res.match = queryError.bind(this, `Query for "${key}" must be a number or a string but was: ${typeof query_value}`);
                        return reject(new Error(`Query for "${key}" must be a number or a string but was: ${typeof query_value}`)); //TODO: !return will not work here
                        break;
                    //if (isNaN(ensured_number)) //TODO reactivate this check somehow
                    //throw new Error('Query for ' + key + ' must be of type number or an expression starting with <, <=, >, or >= following any number, but was: ', query_value);
                }
            } else if (schema_analyzer.value(key).typeOf('array')) {
                if (!Array.isArray(query_value))
                    return reject(new Error(`Query for "${key}" must be an array but was: ${typeof query_value}`));
                    //key_res.match = queryError.bind(this, `Query for "${key}" must be an array but was: ${typeof query_value}`);

                else {
                    key_res.is_array = true;
                    key_res.value = query_value;
                    key_res.match = arrayIncludes.bind(this, query_value);
                }
            }
        }

        return resolve(new ResolvedQuery(result, keys));
    });
};
