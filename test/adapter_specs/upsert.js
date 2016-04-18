/**
 * Created by kalle on 13.04.2016.
 */
import chai from 'chai';
chai.should();
const expect = chai.expect;
import Model from '../../lib/model';
import Joi from 'joi';

export default function (options) {

    describe('and upserting model data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo'];

        describe('-> successful', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect((err) => {
                    model.drop((err) => {
                        model.upsert(data, (err, inserted_model) => {
                            result = inserted_model;
                            done();
                        });
                    });
                });
            });

            after(function(done){
                model.close((err) => {
                    done();
                });
            });

            it('should return the inserted object', function () {
                expect(result.name).to.equal(data.name);
                expect(result.foo).to.equal(data.foo);
                expect(result.bar).to.equal(data.bar);
            });

        });

        describe('-> successful -> overwrite', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };
            let result = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'a_model', options);
                model.connect((err) => {
                    model.drop((err) => {
                        model.insert(data, (err, inserted_model) => {
                            let clone = Object.create(data);
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
                not_foo: 'not a foo',
                bar: 'a bar'
            };
            let error = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'some_model', options);
                model.connect(function(){
                    model.upsert(data, function (err, res) {
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
