/**
 * Created by kalle on 25.04.2016.
 */
import chai from 'chai';
chai.should();
const expect = chai.expect;
import Model from '../../lib/model';
import Joi from 'joi';

export default function (options) {

    describe('and connecting the database', function () {
        const schema = Joi.object().keys({
            name: Joi.string().required(),
            foo: Joi.string().required(),
            bar: Joi.string()
        });

        const index = ['name', 'foo'];


        describe('successful', function () {
            const data = {
                name: 'some name',
                foo: 'a foo',
                bar: 'a bar'
            };

            let con1_err, con2_err, close_err;
            let con1, con2;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect((err, conn) => {
                    con1_err = err;
                    con1 = conn;
                    model.connect((err, conn) => {
                        con2_err = err;
                        con2 = conn;
                        done();
                    });
                });
            });

            after((done) => {
                model.close((err) => {
                    close_err = err;
                    done();
                });
            });

            it('should connection error be null', function () {
                //console.log(connection_err);
                expect(con1_err).to.be.null;
                expect(con2_err).to.be.null;
                expect(con1).to.equal(con2); //TODO: we might not pass out the connection. this is adapter internal
            });

        });

    });

}

