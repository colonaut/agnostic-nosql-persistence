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
                    result.number = result.left = Number(expr.substring(0, expr.length -1)); //<

                    if(isNaN(result.number))
                        result.number = approximately = Number(expr.substring(2, expr.length)); //<=

                    if (isNaN(result.number))
                        result.number = approximately = Number(expr.substring(3, expr.length)); //<==

                    if (isNaN(isNaN(result.number)))
                        throw new Error('invalid search pattern:' + key + expr);
                }
            }
            //schema key would be an array
            else if (schema_analyzer.value(key).typeOf('array')){
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

//TODO: value -> expr, number, array, value || string
//TODO: left -> startsWith

/**
 * !FOR ADAPTER DEVELOPERS ONLY!
 * @param {Object} query
 * @param {SchemaAnalyzer} schema_analyzer
 * @constructor
 */
const QueryAnalyzer = function (query, schema_analyzer) {
    const keys = Object.keys(query);
    const analyzed_query = analyzeQuery(query, schema_analyzer);

    const approximately = analyzed_query.approximately;

    //TODO determinie if it is an indexed query OR directly throw if not
    //TODO: getIndexId should go in here? (then pass only schema analyzer and query analyzer into adapters) -> probably not so good idea

    //NEW

    this.expression = (key) => analyzed_query[key].expr; //TODO: expression ist empty if it is no expr. otherwise ONLY value, number or array is filled

    /**
     * A left query on a string (foo*) for the given key's value
     * @param {string} value The value of the persistence
     * @param {string} key The key of the query object
     * @returns {boolean} true, if expression is relevant and matches
     */
    this.startsWith = (value, key) => String(value).startsWith(analyzed_query[key].left); //TODO check if it is a string? (if, use schema....)

    /**
     * A right query on a string (*foo) for the given key's value
     * @param {string} value The value of the persistence
     * @param {string} key The key of the query object
     * @returns {boolean} true, if expression is relevant and matches
     */
    this.endsWith = (value, key)  => String(value).startsWith(analyzed_query[key].right);

    /**
     * Inner query on a string (*foo*) for the given key's value
     * @param {string} value The value of the persistence
     * @param {string} key The key of the query object
     * @returns {boolean} true, if expression is relevant and matches
     */
    this.contains = (value, key) => String(value).indexOf(analyzed_query[key].inner) > -1;


    // /NEW

    /**
     *
     * @returns {object} The query object with approximation patterns
     */
    this.approximately = () => approximately;

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
    this.value = (key) => analyzed_query[key].value;

    /**
     *
     * @param key
     * @returns {String} The left search pattern ("startsWith") or undefined
     */
    this.left = (key) => analyzed_query[key].left;


    /*!*
     *
     * @param key
     */
    //this.comparison = (key) => analyzed_query[key].comparison; //not yet supported

    /**
     *
     * @param key
     * @returns {Array} Sorted query array or undefined
     */
    this.array = (key) => analyzed_query[key].array;

    /**
     *
     * @param key
     * @returns {Number} The number of the pattern or undefined
     */
    this.number = (key) => analyzed_query[key].number;


};

module.exports = QueryAnalyzer;