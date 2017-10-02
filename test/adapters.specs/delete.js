const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options) {
    describe('and deleting a model', function () {

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
            let model, inserted_id, deleted_id;

            before((done) => {
                persistenceModel(schema, index, 'a_model_delete', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.drop(true, () => {
                            model.upsert(data, (err, res) => {
                                inserted_id = res._id;
                                model.delete(res._id, (err, value) => {
                                    deleted_id = value;
                                    model.fetch(value, (err, res) => {
                                        result = res;
                                        done();
                                    });
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

            it('should return the deleted id', () => {
                expect(inserted_id).to.equal(deleted_id);
            });
            it('should not find the deleted object', function () {
                expect(result).to.equal(undefined);
            });


        });

        describe('which does not exist', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model, id;

            before((done) => {
                persistenceModel(schema, index, 'a_model_delete', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.upsert(data, (err, res) => {
                            id = res._id.substr(0, 5);
                            model.delete(id, (err, deleted_id) => {
                                result = deleted_id;
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

            it('should return the id anyway', () => {
                expect(result).to.equal(id);
            });

        });
    });
};
