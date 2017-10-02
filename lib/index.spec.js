const persistenceModel = require('./index');
const Model = require('./model');
const Joi = require('joi');



describe('When module is required', function(){

    describe('and then used as promise with valid data', function(){
        const schema = Joi.object().keys({
            foo: Joi.string(),
            bar: Joi.string()
        });

        let result, error;
        before((done) => {
            persistenceModel(schema, ['foo'], 'SomeModel').then((model) => {
                result = model;
                done();
            }).catch((err) => {
                error = err;
                done();
            })
        });

        it('expect an instance of Model to be resolvable from the promise', function(){
            expect(result).to.be.an.instanceOf(Model);
        });
    });

    //TODO callback

});