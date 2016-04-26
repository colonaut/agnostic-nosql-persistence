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

            let connection_err = null;
            let close_err = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect((err) => {
                    connection_err = err;
                    done();
                });
            });

            after((done) => {
                model.close((err) => {
                    close_err = err;
                    done();
                });
            });

            it('should connection error be null', function () {
                console.log(connection_err);
                expect(connection_err).to.be.null;
            });

        });

    });

}

