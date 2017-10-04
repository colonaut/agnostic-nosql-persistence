'use strict';

const runConnectSpecs = require('../test/adapters.specs/connect');
const runInsertSpecs = require('../test/adapters.specs/insert.js');
const runExistsSpecs = require('../test/adapters.specs/exists.js');
const runCountSpecs = require('../test/adapters.specs/count.js');
const runUpdateSpecs = require('../test/adapters.specs/update.js');
const runUpsertSpecs = require('../test/adapters.specs/upsert.js');
const runDeleteSpecs = require('../test/adapters.specs/delete.js');
const runFetchSpecs = require('../test/adapters.specs/fetch.js');
const runFindSpecs = require('../test/adapters.specs/find');
const runPerformanceSpecs = require('../test/adapters.specs/performance.js');


describe('When using the CassandraAdapter', function () {
    this.timeout(15000);

    const options = {
        adapter: 'CassandraAdapter',
        host: '10.0.75.2',
        port: 32769
    };
    runConnectSpecs(options);
    runInsertSpecs(options);
    runUpsertSpecs(options);
    runExistsSpecs(options);
    runCountSpecs(options);
    runUpdateSpecs(options);
    runDeleteSpecs(options);
    runFetchSpecs(options);
    runFindSpecs(options, 20);
});

describe('When using the RethinkDbAdapter', function () {
    const options = {
        adapter: 'RethinkDbAdapter',
        host: '10.0.75.2',
        port: 32775
    };

    runConnectSpecs(options);
    runInsertSpecs(options);
    runExistsSpecs(options);
    runCountSpecs(options);
    runUpdateSpecs(options);
    runUpsertSpecs(options);
    runDeleteSpecs(options);
    runFetchSpecs(options);
    runFindSpecs(options, 10000);
});

describe('When using the LevelDbAdapter', function () {
    const options = {
        adapter: 'LevelDbAdapter'
    };

    runConnectSpecs(options);
    runInsertSpecs(options);
    runExistsSpecs(options);
    runCountSpecs(options);
    runUpdateSpecs(options);
    runUpsertSpecs(options);
    runDeleteSpecs(options);
    runFetchSpecs(options);
    runFindSpecs(options, 1000);
});

describe.only('When using the InMemoryAdapter', function () {
    const options = {
        adapter: 'InMemoryAdapter'
    };

    runConnectSpecs(options);
    runInsertSpecs(options);
    runExistsSpecs(options);
    runCountSpecs(options);
    runUpdateSpecs(options);
    runUpsertSpecs(options);
    runDeleteSpecs(options);
    runFetchSpecs(options);
    runFindSpecs(options, 1000);
});


describe('When the InMemoryAdapter is heavily used', function () {
    const options = {
        adapter: 'InMemoryAdapter'
    };

    runPerformanceSpecs(options, 10000, 1000);
});

