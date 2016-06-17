/**
 * Created by kalle on 17.06.2016.
 */
'use strict';
const Joi = require('joi');


function SchemaDetail(key, description){
    const flags = description.flags || {};

    //console.log('SchemaDetail description:', description);

    this.key = () => {
        return key;
    };

    this.describe = () => {
        return description;
    };

    this.precision = () => {
        return flags.precision;
    };

    this.type = () => {
        return description.type;
    };

    this.items = () => {
        if (description.items)
            return new SchemaDetail(key + '_items', description.items[0]);

        return undefined;
    };
}

function SchemaDetails(schema, index){
    const schema_description = Joi.describe(schema);
    const schema_keys = Object.keys(schema_description.children);
    const schema_details = schema_keys.map(key => new SchemaDetail(key, schema_description.children[key])); ;

    this.index = () => {
        return [].concat(index);
    };

    this.keys = () => {
        return schema_keys;
    };

    this.values = (keys) => {
        if (Array.isArray(keys))
            return keys.map(k => schema_details.find(d => d.key() === k));// schema_details.filter(d => keys.indexOf(d.key()) > -1);

        if (typeof keys === 'string')
            return schema_details.find(d => d.key() === keys);

        return schema_details;
    };

    this.describe = () => {
        return schema_description;
    };


}

module.exports = SchemaDetails;