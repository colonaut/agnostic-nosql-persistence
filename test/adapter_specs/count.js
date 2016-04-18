/**
 * Created by kalle on 14.04.2016.
 */
import chai from 'chai';
chai.should();
const expect = chai.expect;
import Model from '../../lib/model';
import Joi from 'joi';
import Async from 'async';

export default function (options) {
    describe('and counting models', function () {
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

            let result = null;
            let model;

            before((done) => {
                model = new Model(schema, index, 'a_model', options);
                model.connect((err) => {
                    model.drop((err) => {

                        const insertions  = [];

                        for (var i = 0; i < 5; i++) {
                            insertions.push(
                                (callback) => {
                                    data.name += i;
                                    model.insert(data, () => {
                                        callback();
                                    });
                                }
                            );
                        }

                        Async.parallel(insertions, () => {
                            model.count((err, count) => {
                                result = count;
                                done();
                            });

                        });

                    });
                });

            });

            after((done) => {
                model.close(() => {
                    done();
                });
            });

            it('expecting to have 5 data rows', function () {
                expect(result).to.equal(5);
            });

        });
    });
};
