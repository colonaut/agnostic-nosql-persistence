const persistenceModel = require('./index');
const Joi = require('joi');



describe('fooooo', function(){

    const schema = Joi.object().keys({
        foo: Joi.string(),
        bar: Joi.string()
    });

    before((done) => {
        let result, error
        persistenceModel(schema, ['foo'], 'SomeModel').then((model) => {
            result = model;
            console.log('TEST', result);
            done();
        }).catch((err) => {
            //console.log(err);
            error = err;
            done();
        })
    });

    it('...', function(){

    });

});