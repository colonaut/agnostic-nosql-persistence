const persistenceModel = require('./index');
const Joi = require('joi');



describe.only('fooooo', function(){

    const schema = Joi.object().keys({
        foo: Joi.string(),
        bar: Joi.string()
    });

    before((done) => {
        let result, error

        persistenceModel(schema, ['foo'], 'SomeModel').then((model) => {
            result = model;
            console.log(result);
        }).catch((err) => {
            console.log(err);
            error = err;
        })

    })


});