const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options) {

    describe('and updating model', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo'];

        describe('unsuccessful - not exists', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let error = null;
            let model;

            before((done) => {
                persistenceModel(schema, index, 'a_simple_model', options).then((persistence_model) => {
                    model = persistence_model;
                    let id = model.getIndexKey(data);
                    model.connect(() => {
                        model.drop(true, () => {
                            model.update(id, data, (err) => {
                                error = err;
                                done();
                            });
                        });
                    });

                });
            });
            after((done) => {
                model.close(function () {
                    done();
                });
            });

            it('should return an error that the object does not exist', function () {
                expect(error.toString()).to.equal('NotFoundError: "a_simple_model~somename~afoo" does not exist');
            });

        });

        describe('successful - overwrite', () => {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model, id;

            before((done) => {
                persistenceModel(schema, index, 'a_simple_model', options).then((persistence_model) => {
                    model = persistence_model;
                    id = model.getIndexKey(data);
                    model.connect(() => {
                        model.insert(data, () => {
                            model.update(id, data, function (err, res) {
                                result = res;
                                done();
                            });
                        });
                    });
                });
            });
            after(function (done) {
                model.close(() => {
                    done();
                });
            });

            it('should return the updated object', function () {
                expect(result.name).to.equal(data.name);
                expect(result.foo).to.equal(data.foo);
                expect(result.bar).to.equal(data.bar);
                expect(result._id).to.equal(id);
            });

        });

        describe('unsuccessful - overwrite', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };

            const data2 = {
                name: 'some name',
                foo: 'another foo',
                bar: 'a bar'
            };

            let error = null;
            let model, id;

            before((done) => {
                persistenceModel(schema, index, 'a_simple_model', options).then((persistence_model) => {
                    model = persistence_model;
                    id = model.getIndexKey(data);
                    model.connect(function () {
                        model.insert(data, () => {
                            model.update(id, data2, function (err, res) {
                                error = err;
                                done();
                            });
                        });
                    });
                });
            });
            after((done) => {
                model.close(function () {
                    done();
                });
            });

            it('should return an conflict error', function () {
                expect(error).to.equal('Conflict: Updating the id during an update is not allowed.');
            });

        });

        describe('-> validation error', () => {
            const data = {
                name: 'some name',
                not_foo: 'not a foo',
                bar: 'a bar'
            };
            let error = null;
            let model;

            before(function (done) {
                persistenceModel(schema, index, 'some_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(function () {
                        model.insert(data, function (err, res) {
                            error = err;
                            done();
                        });
                    });
                });
            });
            after(function (done) {
                model.close(function () {
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
