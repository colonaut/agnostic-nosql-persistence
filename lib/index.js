const PersistenceModel = require('./model');
const resolveSchema = require('resolved-schema');

const default_options = {
    //uri: './db',
    persistence_adapter: 'InMemoryAdapter',
    id_separator: '~',
    version: '0.0.1'
};

/**
 * @module persistenceModel
 * @param {Joi|JSONSchema} schema
 * @param {array} index
 * @param {string} [model_name]
 * @param {object} options Options
 * @param {string|function} options.adapter
 * @param {string} options.db
 * @param {string} options.host
 * @param {number} options.port
 * @param {function} [callback] (err, persistence_model)
 */
module.exports = function (schema, index, model_name, options, callback) {
    if (typeof callback === 'function') { //TODO callback way
        resolveSchema(schema, {index: index}, (err, resolved_schema) => {
            if (err)
                return callback(err);

            return callback(null, new PersistenceModel(resolved_schema, index, model_name, options));
        });
    }

    return resolveSchema(schema, {index: index})
        .then((resolved_schema) => {
            return new PersistenceModel(resolved_schema, index, model_name, options);
        })
        .catch((err) => {
            console.log('!!!!! index:', err);
        });
};
