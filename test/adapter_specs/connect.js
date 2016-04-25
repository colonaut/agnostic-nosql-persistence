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

        const data = {
            name: 'some name',
            foo: 'a foo',
            bar: 'a bar'
        };

        let con_err = null;
        let close_err = null;
        let model = new Model(schema, index, 'a_model', options);

        model.connect((err) => {
            con_err = err;
            model.close((err) => {
                close_err = err;
            })
        });

    });

}

