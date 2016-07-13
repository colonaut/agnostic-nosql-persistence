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
                if (value.startsWith('<') || value.startsWith('>')) {
                    result.comparison = value;
                    result.number = Number(value.substring(1, value.length)); //<

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


    this.approximately = () => approximately;

    /**
     *
     * @returns {Array}
     */
    this.keys = () => keys;

    /**
     *
     * @param key
     * @returns {*}
     */
    this.value = (key) => analyzed_query[key].value;

    /**
     *
     * @param key
     */
    this.left = (key) => analyzed_query[key].left;

    /**
     *
     * @param key
     */
    this.comparison = (key) => analyzed_query[key].comparison;

    /**
     *
     * @param key
     * @returns {Array} Sorted query array
     */
    this.array = (key) => analyzed_query[key].array;

    /**
     *
     * @param key
     */
    this.number = (key) => analyzed_query[key].number;


};

module.exports = QueryAnalyzer;