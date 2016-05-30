/**
 * Created by colonaut on 13.04.2016.
 */
const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.js');
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
                model = new Model(schema, index, 'a_model', options);
                model.connect(() => {
                    model.upsert(data, (err, res) => {
                        inserted_id = res._id;
                        model.delete(res._id, (err, res) => {
                            deleted_id = res;
                            model.fetch(res._id, (err, value) => {
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
                model = new Model(schema, index, 'a_model', options);
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
