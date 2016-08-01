'use strict';

const analyzeQuery = (query, schema_analyzer) => {
    let analyzed_query = {
        approximately: {}
    };

    Object.keys(query).forEach((key) => {
        let value = query[key];
        let approximately = value;
        let result = {
            value: value
        };

        if (typeof value === 'string') {
            //schema key is a regular string, deal with end wildcard
            if (schema_analyzer.value(key).typeOf('string')) {
                if (value.endsWith('*') && !value.endsWith('**'))
                    result.left = approximately = value.substring(0, value.length - 1);
            }
            //schema key would be number
            else if (schema_analyzer.value(key).typeOf('number')) { //could be integer? check analyzer to return triue for any number type
                if (value.endsWith('*') && !value.endsWith('**')) {
                    result.number = result.left = Number(value.substring(0, value.length -1)); //<

                    if(isNaN(result.number))
                        result.number = approximately = Number(value.substring(2, value.length)); //<=

                    if (isNaN(result.number))
                        result.number = approximately = Number(value.substring(3, value.length)); //<==

                    if (isNaN(isNaN(result.number)))
                        throw new Error('invalid search pattern:' + key + value);
                }
            }
            //schema key would be an array
            else if (schema_analyzer.value(key).typeOf('array')){
                if (value.endsWith('*') && !value.endsWith('**')) //TODO better array handling, maybe in schema analyzer
                    result.left = approximately = value.substring(0, value.length - 1);
            }
        }

        else if (typeof value === 'number') {
            if (!schema_analyzer.value(key).typeOf('number'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.number = approximately = Number(value);
        }

        else if (Array.isArray(value)) {
            if (!schema_analyzer.value(key).typeOf('array'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.array = approximately = value.sort();
        }

        analyzed_query[key] = result;
        analyzed_query.approximately[key] = approximately;
    });

    return analyzed_query;
};

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