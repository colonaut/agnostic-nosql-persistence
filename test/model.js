/**
 * Created by kalle on 05.04.2016.
 */
import chai from 'chai';
const  expect = chai.expect;
import assert from 'assert';
import Model from '../lib/model';
import Joi from 'joi';





describe('When creating a Model instance', function(){

    const schema = Joi.object().keys({
        name: Joi.string().required(),
        foo_array: Joi.array().items(Joi.string()),
        bar_array: Joi.array().items(Joi.number()),
        something_else: Joi.string()
    });

    const index = ['name', 'foo_array'];

    describe('with an invalid persistence adapter', function() {
        const model = new Model({}, [], 'a_model', {persistence_adapter: 'InvalidAdapter'});
        it('should the persistence adapter be an instance of the InMemoryAdapter', function(){
            expect(model.adapter.constructor.name).to.equal('InMemoryAdapter');
        });
    });


    describe('with an index containing a string array', function(){
        const data = {
            name: 'a name',
            foo_array: ['banana', ' sweets', '~cucumber', 'chocolate~'],
            bar_array: [3,10,5,3,70,1,100]
        }

        const model = new Model(schema, index, 'test_model');

        it ('should the indexDefinition correctly show array type and required state', function(){
           expect(JSON.stringify(model.indexDefinition)).to.equal(JSON.stringify({
               name: { type: 'string', required: true },
               foo_array: { type: [ 'string' ], required: false }
           }));
        });

        it('should getIndexId return an index containing the sorted and joined array', function(){
            expect(model.getIndexId(data)).to.equal('test_model~aname~banana,chocolate,cucumber,sweets');
        })
    });


    describe('from the MyModelExtension class', function(){

        class MyModelExtension extends Model{
            constructor(schema, index, options){
                super(schema, index, options);
            }
        }

        let model = new MyModelExtension(schema, index, {foo: 'bar'});

        it('should the internal model name be the name of the extended class', () => {
            expect(model._model_name).to.equal('MyModelExtension');
            expect(model._options).to.contain.all.keys({foo: 'bar'});
        });

    });

});


