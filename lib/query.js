/**
 * Created by kalle on 08.07.2016.
 */

/**
 * !FOR ADAPTER DEVELOPERS ONLY!
 * @param {Object} query
 * @param {SchemaAnalyzer} schema_analyzer
 * @constructor
 */
const Query = function (query, schema_analyzer) {

    const keys = Object.keys(query);

    let analyzed_query;
    const analyzeQuery = () => {
        analyzed_query = {};

        keys.forEach((key) => {
            let value = query[key];
            let result = {
                value: value,
                is_approximation: false,
                is_array: false
            };


            //console.log('???', '%', '\%', '\\%')
            //console.log('\\%'.endsWith('\\%'));

            if (typeof value === 'string') {
                if (value.endsWith('*')) {
                    result.value = value.substring(0, value.length - 1);
                    result.is_approximation = true;
                    
                    if (value.endsWith('**'))
                        result.is_approximation = false;
                }

                if (Array.isArray(value))
                    result.is_aray = true;

                analyzed_query[key] = result;
            }
        });
    };


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
    this.value = (key) => {
        if (!analyzed_query)
            analyzeQuery();

        return analyzed_query[key].value;
    };

    this.approximation = (key) => {
        if (!analyzed_query)
            analyzeQuery();

        return analyzed_query[key].is_approximation;
    }

    this.array = (key) => {
        if (!analyzed_query)
            analyzeQuery();

        return analyzed_query[key].is_array;
    }


};

module.exports = Query;