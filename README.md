# agnostic-nosql-persistence

An agnostic persistence abstraction supporting adapters on NoSQL Databases.
Conception and 1st version provided, permission to open source kindly granted by [aduis]

- Context: shared package

**[API Reference](docs/api.md)**


###Issues
- atomically we are screwed. We cannot ensure inserts of docs while we check for existence
- Index on arrays exposes a joined list of arrays. Only works with string or number arrays.
- Search on an array is in conceptual phases. We might go for query for comma separated string: array property contains, query for array: array contents equal in exact order.
- query limits: not yet supported
- connection pool: not yet supported, find a suitable agnostic approach


[aduis]: https://github.com/aduis
