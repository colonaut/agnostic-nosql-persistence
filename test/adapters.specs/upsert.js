const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options) {

    describe('and upserting model data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            source: Joi.array().items(Joi.string()).required(),
            categories: Joi.array().items(Joi.string()),
            description: Joi.string()
        });

        const index = ['name', 'source'];

        describe('-> successful', function () {
            const data = {
                name: 'some name',
                source: ['MA','FR'],
                categories: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let result = null;
            let model;

            before((done) => {
                persistenceModel(schema, index, 'a_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.drop(true, () => {
                            model.upsert(data, (err, inserted_model) => {
                                result = inserted_model;
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
                expect(result.source).to.deep.equal(data.source);
                expect(result.description).to.deep.equal(data.description);
            });

        });

        describe('-> successful -> overwrite', function () {
            const data = {
                name: 'some name',
                source: ['MA','FR'],
                categories: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let result = null;
            let model;

            before(function (done) {
                persistenceModel(schema, index, 'a_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.drop(true, () => {
                            model.upsert(data, () => {
                                let clone = Object.assign({}, data);
                                clone.description = 'an updated description';
                                model.upsert(clone, (err, inserted_model) => {
                                    result = inserted_model;
                                    done();
                                });
                            });
                        });
                    });
                });
            });
            it('should return the inserted object', function () {
                expect(result.name).to.equal(data.name);
                expect(result.source).to.deep.equal(data.source);
                expect(result.description).to.not.equal(data.description);
            });

        });

        describe('-> validation error', function () {
            const data = {
                name: 'some name',
                categories: ['cats', 'dogs'],
                description: 'Lorum ipsum foo bar'
            };
            let error = null;
            let model;

            before(function (done) {
                persistenceModel(schema, index, 'some_model', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect(() => {
                        model.upsert(data, (err, res) => {
                            error = err;
                            done();
                        });
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
                expect(error.message).to.equal('child "source" fails because ["source" is required]');
            });

        });
    });

};
