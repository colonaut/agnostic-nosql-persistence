/**
 * Created by kalle on 08.07.2016.
 */
'use strict';
const expect = require('chai').expect;
const resolveQuery = require('../lib/resolve_query');
const resolveSchema = require('analyze-schema');
const Joi = require('joi');

describe('When creating a Query instance', function () {

    describe('with valid string values', function () {
        const model = {
            foo: 'foo',
            bar: 'bar start',
            buzz: 'bu* you!',
            doh: 'this is nothing'
        };

        const resolved_schema = resolveSchema(Joi.object().keys({
            foo: Joi.string(),
            bar: Joi.string(),
            buzz: Joi.string()
        }), {
            index: ['foo', 'bar', 'buzz']
        });

        const query_data = {
            foo: 'foo',
            bar: 'ba*',
            buzz: 'bu**' //TODO: currently true, as bu** is currently converted to startsWith('bu')
            //TODO: test right, inner;
            //TODO xxx * yyyy query not supported. this has to be made clear in docs
        };

        let query, match, error;

        before(function (done) {
            resolveQuery(query_data, resolved_schema)
                .then((res) => {
                    query = res;
                    query.match(model, (err, res) => {
                        error = err;
                        match = res;
                        done();
                    });
                })
                .catch((err) => {
                    error = err;
                    done();
                });
        });

        it('should the query instance provide a correct exact search object', function () {
            expect(match).to.be.true;
            expect(error).to.be.null;

            expect(query.isArray('foo')).to.be.false;
            expect(query.isNumber('foo')).to.be.false;
            expect(query.value('foo')).to.equal('foo');
            expect(query.expr('foo')).to.be.undefined;
            expect(query.value('foo')).to.be.a.string;

            expect(query.value('bar')).to.be.undefined;
            expect(query.expr('bar')).to.equal('ba*');

            //expect(query.value('buzz')).to.equal('bu*'); //TODO: expr. escaping **
            //expect(query.expr('buzz')).to.be.undefined; //TODO: expr. escaping **
        });
    });

    describe('with valid array values', function () {
        const resolved_schema = resolveSchema(Joi.object().keys({
            array_foo: Joi.array(),
            array_bar: Joi.array(),
            array_buzz: Joi.array()
        }), {
            index: ['array_foo']
        });

        const model = {
            array_foo: ['foo1', 'foo3', 'foo4', 'foo2'],
            array_bar: [1, 2, 3, 4]
        };

        let query, match, error;

        before((done) => {
            resolveQuery({
                array_foo: ['foo1', 'foo2', 'foo3']
            }, resolved_schema)
                .then((resolved_query) => {
                    query = resolved_query;
                    query.match(model, (err, res) => {
                        error = err;
                        match = res;
                        done();
                    });
                })
                .catch((err) => {
                    error = err;
                    done();
                });
        });

        it('should the query instance provide a correct exact search object', function () {
            expect(error).to.be.null;
            expect(match).to.be.true;

            expect(query.value('array_foo').length).to.be.an.array;
            expect(query.value('array_foo').length).to.equal(3);
        });
    });

    describe('with string values for an array property', function () {
        const resolved_schema = resolveSchema(Joi.object().keys({
            array_foo: Joi.array(),
            array_bar: Joi.array(),
            array_buzz: Joi.array()
        }), {
            index: ['array_foo', 'array_bar', 'array_buzz']
        });

        const model = {
            //array_foo: ['foo1', 'foo3', 'foo4', 'foo2'],
            array_bar: [1, 2, 3, 4]
            //array_buzz: []
        };

        let query, match, error;

        before((done) => {
            resolveQuery({
                array_foo: ['foo1', 'foo2', 'foo3'],
                array_bar: 'ba*',
                array_buzz: 1.0000
            }, resolved_schema)
                .then((resolved_query) => {
                    query = query;
                    query.match(model, (err, res) => {
                        //error = err;
                        match = res;
                        done();
                    });
                })
                .catch((err) => {
                    error = err;
                    done();
                });
        });

        it('should return an error', function () {
            expect(error).to.be.an.error;
            expect(match).to.be.undefined;
        });

    });

    describe('with valid umber values', function () {
        const resolved_schema = resolveSchema(Joi.object().keys({
            number_foo: Joi.number(),
            number_bar: Joi.number().precision(0),
            number_buzz: Joi.number()
        }), {
            index: ['number_foo', 'number_bar', 'number_buzz']
        });

        const model = {
            number_foo: 1,
            number_bar: 1.004,
            number_buzz: 2
        };

        let query, match, error;

        before((done) => {
            resolveQuery({
                number_foo: 1,
                number_bar: ' < 1.003',
                number_buzz: '>=1'
            }, resolved_schema)
                .then((resolver_query) => {
                    query = resolver_query;
                    query.match(model, (err, res) => {
                        error = err;
                        match = res;
                        done();
                    });
                })
                .catch((err) => {
                    error = err;
                    done();
                });
        });


        it('should value and expr return the correct values', function () {
            expect(query.value('number_foo')).to.equal(1);
            expect(query.expr('number_foo')).to.be.undefined;

            expect(query.expr('number_bar')).to.equal('< 1.003');
            expect(query.value('number_bar')).to.be.undefined;

            expect(query.expr('number_buzz')).to.equal('>=1');
            expect(query.value('number_buzz')).to.be.undefined;

            expect(error).to.be.null;
            expect(match).to.be.true;
        });
    });

});