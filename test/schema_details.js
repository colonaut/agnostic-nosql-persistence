/**
 * Created by kalle on 17.06.2016.
 */
'use strict';
const Chai = require('chai');
const expect = Chai.expect;
const Joi = require('joi');
const SchemaDetails = require('../lib/schema_details.js');

describe('When creating a SchemaDetails instance', function () {

        const schema = Joi.object().keys({
            name: Joi.string().required(),
            an_integer: Joi.number().integer().required(),
            an_array_of_numbers: Joi.array().items(Joi.number()).required(),
            a_precision_2: Joi.number().precision(2),
            a_precision_8: Joi.number().precision(8),
            a_number: Joi.number()
        });

        const index = ['name', 'an_integer'];
        const schema_details = new SchemaDetails(schema, index);

        it('expect keys() to return the shallow properties of the schema description', function () {
            expect(schema_details.keys().join()).to.equal(Object.keys(schema.describe().children).join());
        });

        it('expect values() to return an array containing a SchemaDetail instance for each key of the shallow schema description', function () {
            expect(schema_details.values()).to.have.length(6);
            expect(schema_details.values(schema_details.index())).to.have.length(2);
            expect(schema_details.values()[0]).to.have.property('describe');
        });

        it('a_precision_2', function(){
            let detail = schema_details.values('a_precision_2');
            expect(detail.precision()).to.equal(2);

        });

        it('an_array_of_numbers', function(){
            let detail = schema_details.values('an_array_of_numbers');
            console.log('TEST', detail.items().type());
        });

    }
);