'use strict';

//TODO async! use callback! (or promises..)
const eql = (query_value, value) => query_value === value;
const lt = (query_value, value) => query_value < value;
const gt = (query_value, value) => query_value > value;
const lte = (query_value, value) => query_value <= value;
const gte = (query_value, value) => query_value >= value;
const left = (query_value, value) => value.startsWith(query_value);
const right = (query_value, value) => value.endsWith(query_value);
const inner = (query_value, value) => value.indexOf(query_value) > -1;
const arrayIncludes = (query_value, value) => {
    value = [].concat(value);
    for (let qv of query_value) {
        if (!value.includes(qv))
            return false;
    }

    return true;
};


const analyze = (query, schema_analyzer) => {
    //TODO: schema_analyzer ust always rturn true fpr typeOf number, if it is a number!
    const result = {};
    Object.keys(query).forEach((key) => {
        let key_res = result[key] = {};
        let query_value = query[key];
        if (schema_analyzer.value(key).typeOf('string')) {
            //TODO: escaping **
            let qv = query_value.trim();
            if (qv.endsWith('*')) {
                if (qv.startsWith('*'))
                    key_res.match = inner.bind(this, qv.substring(1, qv.length));
                    //key_res.inner = qv.substring(1, qv.length);
                else
                    key_res.match = left.bind(this, qv.substring(0, qv.length - 1));
                    //key_res.left = qv.substring(0, qv.length - 1);

                key_res.expression = qv;
            } else if (qv.startsWith('*')) {
                key_res.match = right.bind(this, qv.substring(1, qv.length));
                //key_res.right = qv.substring(1, qv.length);
                key_res.expression = qv;
            } else {
                key_res.match = eql.bind(this, query_value);
                key_res.value = query_value;
            }
        } else if (schema_analyzer.value(key).typeOf('number')) {
            //let ensured_number;
            switch (typeof query_value) {
                case 'number':
                    key_res.is_number = true;
                    key_res.value = Number(query_value);
                    key_res.match = eql.bind(this, Number(query_value));
                    //ensured_number = key_res.value = Number(query_value);
                    break;
                case 'string':
                    key_res.is_number = true;
                    key_res.expression = query_value = query_value.trim();
                    if (query_value.startsWith('<='))
                        key_res.match = lte.bind(this, Number(query_value.substring(2, query_value.length)));
                        //ensured_number = key_res.lte = Number(query_value.substring(2, query_value.length));
                    else if (query_value.startsWith('>='))
                        key_res.match = gte.bind(this, Number(query_value.substring(2, query_value.length)));
                        //ensured_number = key_res.gte = Number(query_value.substring(2, query_value.length));
                    else if (query_value.startsWith('<'))
                        key_res.match = lt.bind(this, Number(query_value.substring(1, query_value.length)));
                        //ensured_number = key_res.lt = Number(query_value.substring(1, query_value.length));
                    else if (query_value.startsWith('>'))
                        key_res.match = gt.bind(this, Number(query_value.substring(1, query_value.length)));
                        //ensured_number = key_res.gt = Number(query_value.substring(1, query_value.length));
                    break;
                default:
                    throw new Error(`Query for "${key}" must be a number or a string but was: ${typeof query_value}`);

                    //if (isNaN(ensured_number)) //TODO reactivate this check somehow
                        //throw new Error('Query for ' + key + ' must be of type number or an expression starting with <, <=, >, or >= following any number, but was: ', query_value);
            }
        } else if (schema_analyzer.value(key).typeOf('array')) {
            if (!Array.isArray(query_value))
                throw new Error(`Query for "${key}" must be an array but was: ${typeof query_value}`);

            key_res.is_array = true;
            key_res.value = query_value;
            key_res.match = arrayIncludes.bind(this, query_value);
        }

    });

    return result;
};


//TODO: value is the value in it's type, if it is not expression
// expression is set if it is an expression. value will be undef.
//

/**
 * !FOR ADAPTER DEVELOPERS ONLY!
 * @param {Object} query
 * @param {SchemaAnalyzer} schema_analyzer
 * @constructor
 */
const QueryAnalyzer = function (query, schema_analyzer) {
    //const analyzed_query = analyzeQuery(query, schema_analyzer); //depr
    //const approximately = analyzed_query.approximately; //depr

    const keys = Object.keys(query);
    const analyzed = analyze(query, schema_analyzer);

    //TODO determinie if it is an indexed query OR directly throw if not
    //TODO: getIndexId should go in here? (then pass only schema analyzer and query analyzer into adapters) -> probably not so good idea
    //TODO: but index search should be provides a function here?

    /**
     *
     * @param key {string}
     * @returns {boolean}
     */
    this.isNumber = (key) => !!analyzed[key].is_number;

    /**
     *
     * @param key {string}
     * @returns {boolean}
     */
    this.isArray = (key) => !!analyzed[key].is_array;

    /**
     *
     * @param {object} model
     * @param {function} callback
     * @returns {boolean}
     */
    this.match = (model, callback) => {
        //TODO: take care of index... ony indexed fields supported? or here open and only in approximation index.. dunno yet
        let is_match = false;
        console.log(keys);
        for (let key of keys){
            console.log(key, model[key], analyzed[key].match);

            if (!model[key])
                return callback(new Error('key mismatch (todo) ' + key), is_match);

            if (typeof analyzed[key].match !== 'function')
                return callback(new Error('no match function ' + key), is_match);

            is_match = !!analyzed[key].match(model[key]);
            if (!is_match)
                return callback(null, is_match);
        }

        return callback(null, is_match);
    };

    /**
     *
     * @returns {Array} The keys of the query
     */
    this.keys = () => keys;

    /**
     *
     * @param key
     * @returns {Array|String} The given query pattern for key
     */
    this.value = (key) => analyzed[key].value;

    this.expr = (key) => analyzed[key].expression;

};

module.exports = QueryAnalyzer;