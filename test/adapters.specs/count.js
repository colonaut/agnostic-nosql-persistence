const persistenceModel = require('./../../lib/index');
const Joi = require('joi');
const Async = require('async');

module.exports = function (options) {
    describe('and counting models', function () {
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
                persistenceModel(schema, index, 'some_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect((err) => {
                        model.drop(true, (err) => {

                            const insertions = [];

                            for (var i = 0; i < 5; i++) {
                                insertions.push(
                                    (callback) => {
                                        data.name += i;
                                        model.insert(data, () => {
                                            callback();
                                        });
                                    }
                                );
                            }

                            Async.parallel(insertions, () => {
                                model.count((err, count) => {
                                    result = count;
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

            it('expecting to have 5 data rows', function () {
                expect(result).to.equal(5);
            });

        });
    });
};
