const persistenceModel = require('./index');
const PersistenceModel = require('./PersistenceModel');
const Joi = require('joi');



describe('When module is required', function(){

    describe('and then used as promise with valid data', function(){
        const schema = Joi.object().keys({
            foo: Joi.string(),
            bar: Joi.string()
        });

        let result, error;
        before((done) => {
            persistenceModel(schema, ['foo'], 'SomeModel').then((persistence_model) => {

                console.log('TEST ?????', persistence_model);


                result = persistence_model;
                done();
            }).catch((err) => {

                console.log('!!!!?!!', err);


                error = err;
                done();
            })
        });

        it('expect an instance of Model to be resolvable from the promise', function(){
            expect(result).to.be.an.instanceOf(PersistenceModel);
        });
    });

    //TODO callback

});