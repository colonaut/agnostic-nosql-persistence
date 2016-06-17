const Chai = require('chai');
Chai.should();
const expect = Chai.expect;
const Model = require('./../../lib/model.js');
const Joi = require('joi');

module.exports = function (options) {

    describe('and inserting model data', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            an_integer: Joi.number().integer().required(),
            an_array_of_numbers: Joi.array().items(Joi.number()).required(),
            a_precision_2: Joi.number().precision(2),
            a_precision_8: Joi.number().precision(8),
            a_number: Joi.number()
        });

        const index = ['name', 'an_integer']; //TODO: test with number array as index also

        describe('-> successful', function () {
            const data = {
                name: 'many numbers model',
                an_integer: 5,
                an_array_of_numbers: [1,2,3,4],
                a_precision_2: 5.00,
                a_precision_8: 0.12345678,
                a_number: 12345.54321
            };
            let result = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_numbers_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        model.insert(data, (err, inserted_model) => {

                            console.error('TEST', err);
                            console.log('TEST', inserted_model);
                            result = inserted_model;
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

            it('should return the inserted object', function () { //TODO: shoud rather return the id?
                //expect(result.name).to.equal(data.name);
                //expect(result.an_integer).to.equal(data.an_integer);
                //expect(result.bar).to.equal(data.bar);
            });

        });

        return;

        describe('-> overwrite error', function () {
            const data = {
                name: 'many numbers model',
                an_integer: 5,
                an_array_of_numbers: [1,2,3,4],
                a_precision_2: 5.00,
                a_precision_8: 0.12345678,
                a_number: 12345.54321
            };
            let error = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'a_numbers_model', options);
                model.connect(() => {
                    model.drop(true, () => {
                        model.insert(data, (err, inserted_model) => {
                            model.insert(data, (err, inserted_model) => {
                                error = err;
                                done();
                            });
                        });
                    });
                });
            });

            after(function(done){
                model.close(function(err){
                    done();
                });
            });

            it('should return DuplicateKeyError', function () {
                expect(error.name).to.equal('DuplicateKeyError');
            });

            it('should return indicator about the duplicate key', function () {
                expect(error.message).to.equal('"a_simple_model~somename~afoo" already exists');
            });

        });
        
        describe('-> validation error', function () {
            const data = {
                name: 'many numbers model',
                an_integer: 5.5,
                an_array_of_numbers: [1,2,3,4],
                a_precision_2: 5.00,
                a_precision_8: 0.12345678,
                a_number: 12345.54321
            };
            let error = null;
            let model;

            before(function (done) {
                model = new Model(schema, index, 'a_numbers_model', options);
                model.connect(function(){
                    model.insert(data, function (err) {
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
                expect(error.message).to.equal('child "an_integer" fails because ["an_integer" is...]');
            });

        });
    });

};