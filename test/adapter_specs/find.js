/**
 * Created by kalle on 14.04.2016.
 */
const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.js');
const Joi = require('joi');

//TODO: find by query

module.exports = function(options, data_count) {
    data_count = data_count || 1000;

    describe('and finding models', function () {

        describe('successful', function () {
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                foo: Joi.string().required(),
                bar: Joi.string()
            });

            const index = ['name', 'foo'];

            const data = {
                name: 'some name',
                foo: 'a ~ foo',
                bar: 'a bar'
            };

            const query = {
                foo: 'a ~ foo10'
            }

            let result = null;
            let model, time;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect(() => {
                    model.drop(() => {
                        let data_array = [];
                        for (let i = 0; i < data_count; i++){
                            data_array.push({
                                name: data.name + i,
                                foo: data.foo + i,
                                bar: data.bar + i
                            });
                        }

                        model.seed(data_array, () => {
                            time = new Date().getTime();
                            model.find(query, (err, found_model) =>{
                                result = found_model;
                                time = new Date().getTime() - time;
                                done();
                            });
                        });
                    });
                });
            });

            after((done) => {
                model.close((err) => {
                    done();
                });
            });

            it('should return the found object', function () {
                console.log(options.persistence_adapter, ': query on', data_count, 'items took', time, 'milliseconds');
                expect(result.length).to.equal(1);
                expect(result[0].foo).to.equal(query.foo);
            });

        });

        describe('with array index - successful', function () {
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                foo: Joi.array().items(Joi.string()).required(),
                bar: Joi.string()
            });

            const index = ['name', 'foo'];

            const data = {
                name: 'some name',
                foo: ['BP','MA'],
                bar: 'a bar'
            };

            const query = {
                foo: 'BP,I7,MA'//['MA','BP','I7']
            }

            let result = null;
            let model, time;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect(() => {
                    model.drop(() => {
                        let data_array = [];
                        for (let i = 0; i < data_count; i++){
                            data_array.push({
                                name: data.name + i,
                                foo: data.foo.concat('I' + i),
                                bar: data.bar + i
                            });
                        }

                        model.seed(data_array, () => {
                            time = new Date().getTime();
                            model.find(query, (err, found_model) =>{
                                result = found_model;
                                time = new Date().getTime() - time;
                                done();
                            });
                        });
                    });
                });
            });

            after((done) => {
                model.close((err) => {
                    done();
                });
            });

            it('should return the found object', function () {
                console.log(options.persistence_adapter, ': query with array index on', data_count, 'items took', time, 'milliseconds');
                expect(result.length).to.equal(1);
                expect(result[0].foo.sort().join()).to.equal(query.foo);//.sort().join());
            });

        });

    });
};
