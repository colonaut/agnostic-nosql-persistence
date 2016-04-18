import { default as runInsertSpecs } from './adapter_specs/insert';
import { default as runExistsSpecs } from './adapter_specs/exists';
import { default as runCountSpecs } from './adapter_specs/count';
import { default as runUpdateSpecs } from './adapter_specs/update';
import { default as runUpsertSpecs } from './adapter_specs/upsert';
import { default as runDeleteSpecs } from './adapter_specs/delete';
import { default as runFetchSpecs } from './adapter_specs/fetch';
import { default as runPerformanceSpecs } from './adapter_specs/performance';

describe('When using the InMemoryAdapter', function() {
    const options = {
        persistence_adapter: 'InMemoryAdapter',
        uri: './some_db'
    };

    runInsertSpecs(options);
    runExistsSpecs(options);
    runCountSpecs(options);
    runUpdateSpecs(options);
    runUpsertSpecs(options);
    runDeleteSpecs(options);
    runFetchSpecs(options);
});

describe('When the InMemoryAdapter is heavily used', function() {
    const options = {
        persistence_adapter: 'InMemoryAdapter',
        uri: './some_db'
    };

    runPerformanceSpecs(options, 10000, 1000);
});
