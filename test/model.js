/**
 * Created by kalle on 05.04.2016.
 */
import chai from 'chai';
const  expect = chai.expect;
import assert from 'assert';
import Model from '../lib/model';

describe('When creating a Model instance', function(){

    describe('with an invalid persistence adapter', function() {
        let model = new Model({}, [], 'a_model', {persistence_adapter: 'InvalidAdapter'});
        it('should the persistence adapter be an instance of the InMemoryAdapter', function(){
            expect(model.adapter.constructor.name).to.equal('InMemoryAdapter');
        });
    });

});