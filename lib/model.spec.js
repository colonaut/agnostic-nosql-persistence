'use strict';
const persistenceModel = require('./index');
const Model = require('./model');
const Joi = require('joi');


describe('When creating a Model instance', function(){
    const schema = Joi.object().keys({
        name: Joi.string().required(),
        foo_array: Joi.array().items(Joi.string()),
        bar_array: Joi.array().items(Joi.number()),
        something_else: Joi.string()
    });
    const index = ['name', 'foo_array'];

    describe('with an invalid persistence adapter', function() {
        let model, error;
        before((done) => {
            persistenceModel(schema, [], 'a_model', {adapter: 'InvalidAdapter'}).then((persistence_model) => {
                model = persistence_model;
                done();
            }).catch((err) => {
                error = err;
                done();
            });
        });

        it('should the persistence adapter be an instance of the InMemoryAdapter', function(){
            expect(model).to.be.an.instanceOf(Model);
            expect(error).to.be.undefined;
        });
    });

    describe.only('with an index containing a string array', function(){
        const data = {
            name: 'a name',
            foo_array: ['banana', ' sweets', '~cucumber', 'chocolate~'],
            bar_array: [3,10,5,3,70,1,100]
        };
        let model, error;
        before((done) => {
            let model, error;
            persistenceModel(schema, index, 'test_model').then((persistence_model) => {
                model = persistence_model;
                console.log('TEST', model);
                done();
            }).catch((err) => {
                error = err;
                console.log('TEST', error);
                done();
            });
        });
 
        it('should getIndexId return an index containing the sorted and joined array', function(){
            expect(model.getIndexKey(data)).to.equal('test_model~aname~banana,chocolate,cucumber,sweets');
        })
    });


});


