'use strict';

const analyzeQuery = (query, schema_analyzer) => {
    let analyzed_query = {};
    Object.keys(query).forEach((key) => {
        let value = query[key];
        let result = {
            value: value
        };

        if (typeof value === 'string') {
            //schema key is a regular string, deal with end wildcard
            if (value.endsWith('*')) {
                result.value = value.substring(0, value.length - 1);
                result.approximation = '>';

                if (value.endsWith('**'))
                    delete result.approximation;
            }
            //schema key would be number
            else if(value.startsWith('<') || value.startsWith('>')){
                result.comparison = value.substring(0,1);
                value = value.substring(1, value.length);

                if (value.startsWith('=')) {
                    result.comparison += '=';
                    value = value.substring(1, value.length);
                }

                result.value = Number(value);
            }
            //schema key would be an array
        }

        else if (typeof value === 'number'){
            if (!schema_analyzer.value(key).typeOf('number'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.number = schema_analyzer.value(key).type();
        }

        else if (Array.isArray(value)) {
            if (!schema_analyzer.value(key).typeOf('array'))
                throw new Error('search pattern does not match schema type' + key + schema_analyzer.value(key).type());

            result.array = value.length;
        }

        analyzed_query[key] = result;
    });

    return analyzed_query;
};

/**
 * !FOR ADAPTER DEVELOPERS ONLY!
 * @param {Object} query
 * @param {SchemaAnalyzer} schema_analyzer
 * @constructor
 */
const Query = function (query, schema_analyzer) {
    const keys = Object.keys(query);
    const analyzed_query = analyzeQuery(query, schema_analyzer);

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
    this.approximation = (key) => analyzed_query[key].approximation;

    /**
     *
     * @param key
     */
    this.comparison = (key) => analyzed_query[key].comparison;

    /**
     *
     * @param key
     */
    this.array = (key) => analyzed_query[key].array;

    this.number = (key) => analyzed_query[key].number;


};

module.exports = Query;