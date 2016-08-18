'use strict';

//TODO approximately should be deprecated


const analyzeQuery = (query, schema_analyzer) => {
    let analyzed_query = {
        approximately: {}
    };

    Object.keys(query).forEach((key) => {
        let expr = query[key];
        let approximately = expr;
        let result = {
            value: expr
        };

        if (typeof expr === 'string') {
            //schema key is a regular string, deal with end wildcard
            if (schema_analyzer.value(key).typeOf('string')) {
                expr = expr.trim();
                if (expr.endsWith('*') && !expr.endsWith('**'))
                    result.left = approximately = expr.substring(0, expr.length - 1);
            }
            //schema key would be number
            else if (schema_analyzer.value(key).typeOf('number')) { //could be integer? check analyzer to return triue for any number type
                if (expr.endsWith('*') && !expr.endsWith('**')) {
                    result.number = result.left = Number(expr.substring(0, expr.length - 1)); //<

                    if (isNaN(result.number))
                        result.number = approximately = Number(expr.substring(2, expr.length)); //<=

                    if (isNaN(result.number))
                        result.number = approximately = Number(expr.substring(3, expr.length)); //<==

                    if (isNaN(isNaN(result.number)))
                        throw new Error('invalid search pattern:' + key + expr);
                }
            }
            //schema key would be an array
            else if (schema_analyzer.value(key).typeOf('array')) {
                if (expr.endsWith('*') && !expr.endsWith('**')) //TODO better array handling, maybe in schema analyzer
                    result.left = approximately = expr.substring(0, expr.length - 1);
            }
        }

        else if (typeof expr === 'number') {
            if (!schema_analyzer.value(key).typeOf('number'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.number = approximately = Number(expr);
        }

        else if (Array.isArray(expr)) {
            if (!schema_analyzer.value(key).typeOf('array'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.array = approximately = expr.sort();
        }

        analyzed_query[key] = result;
        analyzed_query.approximately[key] = approximately;
    });

    return analyzed_query;
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
                    key_res.inner = qv.substring(1, qv.length);
                else
                    key_res.left = qv.substring(0, qv.length - 1);

                key_res.expression = qv;
            } else if (qv.startsWith('*')) {
                key_res.right = qv.substring(1, qv.length);
                key_res.expression = qv;
            } else
                key_res.value = query_value;

        } else if (schema_analyzer.value(key).typeOf('number')) {
            let ensured_numner;
            switch (typeof query_value) {
                case 'number':
                    key_res.is_number = true;
                    ensured_numner = key_res.value = Number(query_value);
                    break;
                case 'string':
                    key_res.is_number = true;
                    key_res.expression = query_value = query_value.trim();
                    if (query_value.startsWith('<='))
                        ensured_numner = key_res.lte = Number(query_value.substring(2, query_value.length));
                    else if (query_value.startsWith('>='))
                        ensured_numner = key_res.gte = Number(query_value.substring(2, query_value.length));
                    else if (query_value.startsWith('<'))
                        ensured_numner = key_res.lt = Number(query_value.substring(1, query_value.length));
                    else if (query_value.startsWith('>'))
                        ensured_numner = key_res.gt = Number(query_value.substring(1, query_value.length));
                    break;
                default:
                    throw new Error(`Query for "${key}" must be a number or a string but was: ${typeof query_value}`);

                    if (isNaN(ensured_numner))
                        throw new Error('Query for ' + key + ' must be of type number or an expression starting with <, <=, >, or >= following any number, but was: ', query_value);
            }
        } else if (schema_analyzer.value(key).typeOf('array')) {
            if (!Array.isArray(query_value))
                throw new Error(`Query for "${key}" must be an array but was: ${typeof query_value}`);

            key_res.is_array = true;
            key_res.value = query_value;
        }

        key_res[key];
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
     * @param value
     * @param key
     * @returns {boolean}
     */
    this.match = (value, key) => {
        if (!!analyzed[key].is_array) {
            value = [].concat(value);
            for (let qv of analyzed[key].value) {
                if (!value.includes(qv))
                    return false;
            }

            return true;
        }

        if (!!analyzed[key].is_number)
            return Number(value) > analyzed[key].gt
                || Number(value) >= analyzed[key].gte
                || Number(value) < analyzed[key].lt
                || Number(value) <= analyzed[key].lte;


        return String(value).startsWith(analyzed_query[key].left)
            || String(value).endsWith(analyzed_query[key].right)
            || String(value).indexOf(analyzed_query[key].inner) > -1

    };

    /**
     *
     * @returns {object} The query object with approximation patterns
     */
    this.approximately = () => approximately; //depr

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