const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options, data_count, expected_max_time) {
    data_count = data_count || 1000;
    expected_max_time = expected_max_time || 1000;

    describe('and inserting ' + data_count + ' model\'s data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo', 'bar'];
        let result = [];
        let model,
            time;

        before((done) => {
            model = new Model(schema, index, 'a_model', options);
            model.connect(() => {
                time = new Date().getTime();
                model.drop(() => {
                    for (let i = 0; i < data_count; i++) {
                        let data = {
                            name: 'some name' + i,
                            foo: 'a foo',
                            bar: 'a bar'
                        };
                        model.insert(data, (err, inserted_model) => {
                            result.push(inserted_model);
                        });
                    }
                    time = new Date().getTime() - time;
                    done();
                });
            });
        });

        after(function(done){
            model.close(() => {
                done();
            });
        });

        it('should return the inserted objects within ' + expected_max_time / 1000 + ' seconds', function () {
            console.log(options.persistence_adapter, ': insert', data_count, 'models took', time / 1000, 'seconds');
            expect(time).to.be.below(expected_max_time);
            expect(result.length).to.equal(data_count);
        });

    });

    describe('and seeding ' + data_count + ' model\'s partly erroneous data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo', 'bar'];
        let result,
            model,
            time;

        before((done) => {
            model = new Model(schema, index, 'a_model', options);
            model.connect(() => {
                time = new Date().getTime();
                model.drop(() => {
                    let data_array = [];
                    for (let i = 0; i < data_count; i++) {
                        let data = {
                            name: 'some name' + i,
                            foo: 'a foo',
                            bar: 'a bar'
                        };

                        if (i === 1)
                            data.foo = null;

                        data_array.push(data);

                    }

                    model.seed(data_array, (err, res) => {
                        result = res;
                    });

                    time = new Date().getTime() - time;
                    done();
                });
            });
        });

        after((done) => {
            model.close(() => {
                done();
            });
        });

        it('should return the inserted objects within ' + expected_max_time / 1000 + ' seconds', function () {
            console.log(options.persistence_adapter, ': seed', data_count, 'models took', time / 1000, 'seconds');
            expect(time).to.be.below(expected_max_time);
            expect(result).to.equal(data_count - 1);
        });

    });

};