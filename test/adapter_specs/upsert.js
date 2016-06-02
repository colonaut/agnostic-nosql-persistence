/**
 * Created by kalle on 13.04.2016.
 */
const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.js');
const Joi = require('joi');

module.exports = function (options) {

    describe('and upserting model data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            source: Joi.array().items(Joi.string()).required(),
            category: Joi.array().items(Joi.string()),
            description: Joi.string()
        });

        const index = ['name', 'source'];

        describe('-> successful', function () {
            const data = {
                name: 'some name',
                source: ['MA','FR'],
                category: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let result = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        done();
                        /*model.upsert(data, (err, inserted_model) => {
                            result = inserted_model;
                            done();
                        });*/
                    });
                });
            });

            after((done) => {
                model.close(() => {
                    done();
                });
            });

            it('should return the inserted object', function () {
                //expect(result.name).to.equal(data.name);
                //expect(result.foo).to.equal(data.foo);
                //expect(result.bar).to.equal(data.bar);
            });

        });
return;
        describe('-> successful -> overwrite', function () {
            const data = {
                name: 'some name',
                source: ['MA','FR'],
                category: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let result = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'a_model', options);
                model.connect(() => {
                    model.drop(() => {
                        model.insert(data, (err, inserted_model) => {
                            let clone = Object.assign({}, data);
                            clone.bar = 'an updated bar';
                            model.upsert(clone, (err, inserted_model) => {
                                result = inserted_model;
                                done();
                            });
                        });
                    });
                });
            });

            it('should return the inserted object', function () {
                expect(result.name).to.equal(data.name);
                expect(result.foo).to.equal(data.foo);
                expect(result.bar).to.not.equal(data.bar);
            });

        });

        describe('-> validation error', function () {
            const data = {
                name: 'some name',
                source: ['MA','FR'],
                category: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let error = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'some_model', options);
                model.connect(() => {
                    model.upsert(data, (err, res) => {
                        error = err;
                        done();
                    });
                });
            });

            after((done) => {
                model.close(function(){
                    done();
                });
            });

            it('should return ValidationError', function () {
                expect(error.name).to.equal('ValidationError');
            });
            it('should return indicator about the missing value', function () {
                expect(error.message).to.equal('child "foo" fails because ["foo" is required]');
            });

        });
    });

};
