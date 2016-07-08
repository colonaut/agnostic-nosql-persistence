/**
 * Created by kalle on 08.07.2016.
 */
'use strict';
const expect = require('chai').expect;
const Query = require('../lib/query.js');
const analyze = require('analyze-schema');
const Joi = require('joi');

describe('When creating a Query instance', function() {

    describe('with exact or left approximation string values', function () {

        const query = new Query({
            foo: 'foo',
            bar: 'ba*',
            buzz: 'bu**'
        });

        it('should the query instance provide a correct exact search object', function () {
            expect(query.value('foo')).to.equal('foo');
            expect(query.array('foo')).to.equal(undefined);
            expect(query.approximation('foo')).to.equal(undefined);

            expect(query.value('bar')).to.equal('ba');
            expect(query.array('bar')).to.equal(undefined);
            expect(query.approximation('bar')).to.equal('>');

            expect(query.value('buzz')).to.equal('bu*');
            expect(query.array('buzz')).to.equal(undefined);
            expect(query.approximation('buzz')).to.equal(undefined);
        });
    });

    describe('with exact or left approximation array values', function () {

        const schema_analyzer = analyze(Joi.object().keys({
            array_foo: Joi.array(),
            array_bar: Joi.array(),
            array_buzz: Joi.array()
        }));

        const query = new Query({
            array_foo: ['foo1', 'foo2', 'foo3'],
            array_bar: 'ba*',
            array_buzz: 'bu**'
        }, schema_analyzer);

        let exception;

        it('should the query instance provide a correct exact search object', function () {
            expect(query.value('array_foo').length).to.equal(3);
            expect(query.array('array_foo')).to.equal(3);
            expect(query.approximation('array_foo')).to.equal(undefined);

            expect(query.value('array_bar')).to.equal('ba');
            expect(query.array('array_bar')).to.equal(undefined);
            expect(query.approximation('array_bar')).to.equal('>');

            expect(query.value('array_buzz')).to.equal('bu*');
            expect(query.array('array_buzz')).to.equal(undefined);
            expect(query.approximation('array_buzz')).to.equal(undefined);
        });
    });

    describe('with exact and <,<=,>,>= comparison number values', function () {

        const schema_analyzer = analyze(Joi.object().keys({
            number_foo: Joi.number(),
            number_bar: Joi.number().precision(0),
            number_buzz: Joi.number()
        }));

        const query = new Query({
            number_foo: 1,
            number_bar: '<=1.003',
            number_buzz: '>=1'
        }, schema_analyzer);

        let exception;

        it('should the query instance provide a correct exact search object', function () {
            expect(query.value('number_foo')).to.equal(1);
            expect(query.comparison('number_foo')).to.equal(undefined);

            expect(query.value('number_bar')).to.equal(1.003);
            expect(query.comparison('number_bar')).to.equal('<=');

            expect(query.value('number_buzz')).to.equal(1);
            expect(query.comparison('number_buzz')).to.equal('>=');
        });
    });

});