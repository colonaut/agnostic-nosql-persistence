'use strict';

const runConnectSpecs = require('../test/adapters.specs/connect.js');
const runInsertSpecs = require('../test/adapters.specs/insert.js');
const runExistsSpecs = require('../test/adapters.specs/exists.js');
const runCountSpecs = require('../test/adapters.specs/count.js');
const runUpdateSpecs = require('../test/adapters.specs/update.js');
const runUpsertSpecs = require('../test/adapters.specs/upsert.js');
const runDeleteSpecs = require('../test/adapters.specs/delete.js');
const runFetchSpecs = require('../test/adapters.specs/fetch.js');
const runFindSpecs = require('../test/adapters.specs/find.js');
const runPerformanceSpecs = require('../test/adapters.specs/performance.js');


describe('When using the CassandraAdapter', function () {
    return;
    this.timeout(15000);

    const options = {
        persistence_adapter: 'CassandraAdapter',
        host: '10.0.75.2',
        port: 32769
    };
    //runConnectSpecs(options);
    //runInsertSpecs(options);
    //runUpsertSpecs(options);
    //runExistsSpecs(options);
    //runCountSpecs(options);
    //runUpdateSpecs(options);
    //runDeleteSpecs(options);
    //runFetchSpecs(options);
    runFindSpecs(options, 20);
});

describe('When using the RethinkDbAdapter', function () {
    const options = {
        persistence_adapter: 'RethinkDbAdapter',
        host: '10.0.75.2',
        port: 32775
    };
    return;
    //runConnectSpecs(options);
    //runInsertSpecs(options);
    /*runExistsSpecs(options);
     runCountSpecs(options);
     runUpdateSpecs(options);
     runUpsertSpecs(options);
     runDeleteSpecs(options);
     runFetchSpecs(options);
     runFindSpecs(options, 10000);*/
});

describe('When using the LevelDbAdapter', function () {
    const options = {
        persistence_adapter: 'LevelDbAdapter'
    };

    return;
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

describe('When using the InMemoryAdapter', function () {
    const options = {
        persistence_adapter: 'InMemoryAdapter'
    };

    /*    runConnectSpecs(options);
     runInsertSpecs(options);
     runExistsSpecs(options);
     runCountSpecs(options);
     runUpdateSpecs(options);
     runUpsertSpecs(options);
     runDeleteSpecs(options);
     runFetchSpecs(options);*/
    runFindSpecs(options, 1000);
});


describe('When the InMemoryAdapter is heavily used', function () {
    const options = {
        persistence_adapter: 'InMemoryAdapter'
    };
    return;
    runPerformanceSpecs(options, 10000, 1000);
});

