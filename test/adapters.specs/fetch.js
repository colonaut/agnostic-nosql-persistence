/**
 * Created by kalle on 13.04.2016.
 */
const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.js');
const Joi = require('joi');

module.exports = function(options) {
    describe('and fetching a model', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo'];

        describe('successful', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_simple_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        model.upsert(data, (err, inserted_model) => {
                           model.fetch(inserted_model._id, (err, found_model) =>{
                               result = found_model;
                               done();
                           });
                        });
                    });
                });
            });

            after((done) => {
                model.close(() => {
                    done();
                });
            });

            it('should return the inserted object', function () {
                expect(result.name).to.equal(data.name);
                expect(result.foo).to.equal(data.foo);
                expect(result.bar).to.equal(data.bar);
            });

        });

        describe('with a partly key', function () {

            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'a_simple_model', options);
                model.connect(() => {
                    model.upsert(data, (err, inserted_model) => {
                        model.fetch(inserted_model._id.substr(0, 2), (err, value) => {
                            result = value;
                            done();
                        });
                    });
                });
            });

            after((done) => {
                model.close(() => {
                    done();
                });
            });

            it('should return undefined', function () {
                expect(result).to.equal(undefined);
            });

        });

    });
};