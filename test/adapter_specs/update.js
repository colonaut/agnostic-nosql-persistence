/**
 * Created by kalle on 13.04.2016.
 */
const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.es6');
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
                model = new Model(schema, index, 'a_model', options);
                let id = model.getIndexId(data);
                model.connect(() => {
                    model.drop(() => {
                        model.update(id, data, (err) => {
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

            it('should return an error that the object does not exist', function () {
                expect(error.toString()).to.equal('NotFoundError: "a_model~somename~afoo" does not exist');
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
                model = new Model(schema, index, 'a_model', options);
                id = model.getIndexId(data);
                model.connect(() => {
                    model.insert(data, () => {
                        model.update(id, data, function (err, res) {
                            result = res;
                            done();
                        });
                    });
                });

            });

            after(function(done){
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
                model = new Model(schema, index, 'a_model', options);
                id = model.getIndexId(data);
                model.connect(function () {
                    model.insert(data, () => {
                        model.update(id, data2, function (err, res) {
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
                model = new Model(schema, index, 'some_model', options);
                model.connect(function(){
                    model.insert(data, function (err, res) {
                        error = err;
                        done();
                    });
                });
            });

            after(function(done){
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
