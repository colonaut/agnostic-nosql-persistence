'use strict';

const runConnectSpecs = require('./adapter_specs/connect.js');
const runInsertSpecs = require('./adapter_specs/insert.js');
const runExistsSpecs = require('./adapter_specs/exists.js');
const runCountSpecs = require('./adapter_specs/count.js');
const runUpdateSpecs = require('./adapter_specs/update.js');
const runUpsertSpecs = require('./adapter_specs/upsert.js');
const runDeleteSpecs = require('./adapter_specs/delete.js');
const runFetchSpecs = require('./adapter_specs/fetch.js');
const runFindSpecs = require('./adapter_specs/find.js');
const runPerformanceSpecs = require('./adapter_specs/performance.js');


describe('When using the CassandraAdapter', function () {
    this.timeout(10000);

    const options = {
        persistence_adapter: 'CassandraAdapter',
        host: '10.0.75.2',
        port: 32779
    };
    runConnectSpecs(options);
    runInsertSpecs(options);
    return;
    //runUpsertSpecs(options);
    //runExistsSpecs(options);
    //runCountSpecs(options);
    //runUpdateSpecs(options);
    //runDeleteSpecs(options);
    //runFetchSpecs(options);
    //runFindSpecs(options, 10000);
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
    return;
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

