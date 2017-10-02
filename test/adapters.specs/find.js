const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

//TODO: find by query

module.exports = function(options, data_count) {
    data_count = data_count || 1000;

    describe('and finding models', function () {

        describe('equals on string - successful', function () {

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
            };

            let result = null;
            let model, stime, time;

            before((done) => {
                model = new Model(schema, index, 'test_strings_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        let data_array = [];
                        for (let i = 0; i < data_count; i++){
                            data_array.push({
                                name: data.name + i,
                                foo: data.foo + i,
                                bar: data.bar + i
                            });
                        }

                        stime = new Date().getTime();
                        model.seed(data_array, () => {
                            stime = new Date().getTime() - stime;
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
                model.close(() => {
                    done();
                });
            });

            it('should return the found object', function () {
                console.log('/***');
                console.log(options.persistence_adapter, ': query on', data_count, 'items took', time, 'ms (seed:', stime, 'ms)');
                console.log('***/');
                //expect(result.length).to.equal(1);
                //expect(result[0].foo).to.equal(query.foo);
            });

        });

        describe('contains search on array index - successful', function () {

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
                foo: ['I7','BP','MA'] //or: '~BP,I7,MA' //but that needs exact sorted order.. so rather not use it. It's an array, search for an array!
            };

            let result = null;
            let model, stime, time;

            before((done) => {
                model = new Model(schema, index, 'test_array_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        let data_array = [];
                        for (let i = 0; i < data_count; i++){
                            data_array.push({
                                name: data.name + i,
                                foo: data.foo.concat('I' + i),
                                bar: data.bar + i
                            });
                        }

                        stime = new Date().getTime();
                        model.seed(data_array, (err, res) => {
                            stime = new Date().getTime() - stime;
                            time = new Date().getTime();
                            model.find(query, (err, found_models) =>{

                                console.error('TEST', err);
                                console.log('TEST found_models', found_models);

                                result = found_models;
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
                console.log('\n/* TEST **');
                console.log(options.persistence_adapter, ': query with array index on', data_count, 'items took', time, 'ms, (seed:', stime, 'ms)');
                console.log('***/');
                expect(result.length).to.equal(1);
                expect(result[0].foo.sort().join()).to.equal(query.foo.sort().join());
            });

        });

        describe('startsWith on string index and contains on list index - successful', function () {
            const schema = Joi.object().keys({
                name: Joi.string().required(),
                foo: Joi.array().items(Joi.string()).required(),
                bar: Joi.string()
            });

            const index = ['name', 'foo', 'bar'];

            const data = {
                name: 'some name',
                foo: ['BP','MA'],
                bar: 'a bar'
            };

            const query = {
                name: 'some name no11*',
                foo: ['MA']
            };

            let result = null;
            let model, stime, time;

            before((done) => {
                model = new Model(schema, index, 'test_strings_and_arrays_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        let data_array = [];
                        for (let i = 0; i < data_count; i++){
                            data_array.push({
                                name: data.name + ' no' + i,
                                foo: data.foo.concat('I' + i),
                                bar: data.bar + i
                            });
                        }

                        stime = new Date().getTime();
                        model.seed(data_array, (err, res) => {
                            stime = new Date().getTime() - stime;
                            time = new Date().getTime();
                            model.find(query, (err, found_models) => {
                                result = found_models;
                                time = new Date().getTime() - time;
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

            it('should return ' + parseInt(data_count / 11) + ' found objects', function () {
                console.log('/***');
                console.log(options.persistence_adapter, ': query with array index on', data_count, 'items took', time, 'ms, (seed:', stime, 'ms)');
                console.log('***/');
                expect(result.length).to.equal(parseInt(data_count / 11));
            });

        });

    });
};
