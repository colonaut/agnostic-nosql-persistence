/**
 * Created by kalle on 08.07.2016.
 */
'use strict';
const expect = require('chai').expect;
const Query = require('../lib/query.js');

describe('When creating a Query instance', function() {

    describe('with exact and approximation string values', function () {

        const query = new Query({
            foo: 'foo',
            bar: 'ba*',
            buzz: 'bu**'
        });

        it('should the query instance provide a correct exact search object', function () {
            expect(query.value('foo')).to.equal('foo');
            expect(query.array('foo')).to.equal(false);
            expect(query.approximation('foo')).to.equal(false);

            expect(query.value('bar')).to.equal('ba');
            expect(query.array('bar')).to.equal(false);
            expect(query.approximation('bar')).to.equal(true);

            expect(query.value('buzz')).to.equal('bu*');
            expect(query.array('buzz')).to.equal(false);
            expect(query.approximation('buzz')).to.equal(false);
        });
    });

});