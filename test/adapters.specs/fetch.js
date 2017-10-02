const persistenceModel = require('./../../lib/index');
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
                persistenceModel(schema, index, 'a_simple_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.drop(true, () => {
                            model.upsert(data, (err, inserted_model) => {
                                model.fetch(inserted_model._id, (err, found_model) => {
                                    result = found_model;
                                    done();
                                });
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
                persistenceModel(schema, index, 'a_simple_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.upsert(data, (err, inserted_model) => {
                            model.fetch(inserted_model._id.substr(0, 2), (err, value) => {
                                result = value;
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

            it('should return undefined', function () {
                expect(result).to.equal(undefined);
            });

        });

    });
};