const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options) {
    describe('and check if a model exists', function () {
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
                persistenceModel(schema, index, 'a_model_connect', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.upsert(data, (err, res) => {
                            model.exists(res._id, (err, value) => {
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

            it('should return true', function () {
                expect(result).to.equal(true);
            });

        });

        describe('unsuccessful', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model;

            before((done) => {
                persistenceModel(schema, index, 'a_model_connect', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(function () {
                        model.upsert(data, () => {
                            model.exists('asdklasjkldjasd', (err, value) => {
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

            it('should return false', function () {
                expect(result).to.equal(false);
            });

        });
    });
};
