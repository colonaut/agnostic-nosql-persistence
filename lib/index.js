const Model = require('./model');
const resolveSchema = require('resolved-schema');

const default_options = {
    //uri: './db',
    persistence_adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};

/**
 * @param schema
 * @param index
 * @param [model_name]
 * @param {object} options Options
 * @param {string|function} options.adapter
 * @param {string} options.db
 * @param {string} options.host
 * @param {number} options.port
 * @param {function} [callback]
 */

//TODO: get a promse via factory!!!! (won't work with resolved schema as this is a promise as well....

module.exports = function (schema, index, model_name, options, callback) {
    if (typeof callback === 'function') {
        if (error)
            return callback(error);

        return callback(null, new Model());
    }

    return resolveSchema(schema, {index: index})
        .then((resloved_schema) => {
            return new Model(resloved_schema, index, model_name, options);
        })
        .catch((err) => {
            console.log(err);
        });
};
