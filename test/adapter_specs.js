import { default as runConnectSpecs } from './adapter_specs/connect';
import { default as runInsertSpecs } from './adapter_specs/insert';
import { default as runExistsSpecs } from './adapter_specs/exists';
import { default as runCountSpecs } from './adapter_specs/count';
import { default as runUpdateSpecs } from './adapter_specs/update';
import { default as runUpsertSpecs } from './adapter_specs/upsert';
import { default as runDeleteSpecs } from './adapter_specs/delete';
import { default as runFetchSpecs } from './adapter_specs/fetch';
import { default as runFindSpecs } from './adapter_specs/find';
import { default as runPerformanceSpecs } from './adapter_specs/performance';


describe('When using the CassandraAdapter', function() {
    this.timeout(5000); //the default connect timout for cassandra is 5000

    const options = {
        persistence_adapter: 'CassandraAdapter',
        host: '192.168.99.100',
        port: 32774
    };

    runConnectSpecs(options);
    //runInsertSpecs(options);
    /*runExistsSpecs(options);
     runCountSpecs(options);
     runUpdateSpecs(options);
     runUpsertSpecs(options);
     runDeleteSpecs(options);
     runFetchSpecs(options);
     runFindSpecs(options, 10000);*/
});

describe('When using the RethinkDbAdapter', function() {
    const options = {
        persistence_adapter: 'RethinkDbAdapter',
        host: '192.168.99.100',
        port: 32775
    };

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

/*
describe('When using the InMemoryAdapter', function() {
    const options = {
        persistence_adapter: 'InMemoryAdapter'
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


describe('When the InMemoryAdapter is heavily used', function() {
    const options = {
        persistence_adapter: 'InMemoryAdapter'
    };

    runPerformanceSpecs(options, 10000, 1000);
});
*/
