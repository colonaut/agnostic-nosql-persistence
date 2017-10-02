const persistenceModel = require('./../../lib/index');
const Joi = require('joi');

module.exports = function (options) {
    describe('and connecting the database', function () {

        const schema = Joi.object().keys({
            name: Joi.string().required(),
            source: Joi.array().items(Joi.string()).required(),
            category: Joi.array().items(Joi.string()),
            description: Joi.string()
        });

        const index = ['name', 'source'];

        describe('successful', function () {
            let con1_err, con2_err;
            let con1, con2;
            let model;

            before((done) => {
                persistenceModel(schema, index, 'a_model_connect', options).then((persistence_model) => {
                    model = persistence_model;
                    model.connect((err, conn) => {
                        con1_err = err;
                        con1 = conn;
                        model.connect((err, conn) => {
                            con2_err = err;
                            con2 = conn;
                            done();
                        });
                    });
                }).catch((err) => {
                    console.log('TEST INVALID:', err);
                });

            });

            after((done) => {
                model.close(() => {
                    done();
                });
            });

            it('should connection error be null', function () {
                expect(con1_err).to.be.null;
                expect(con2_err).to.be.null;
            });

            it('should a doubled connect return the same connection', function () {
                expect(con1).to.equal(con2); //TODO: we might not pass out the connection. this is adapter internal
            });

        });

    });

};

