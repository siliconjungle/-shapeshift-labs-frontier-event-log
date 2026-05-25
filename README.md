# Frontier Event Log

Reserved package name for a future optional Frontier event-log package.

This package is not ready for production use. It exists so the package and repository names are reserved while durable event log, operation stream, projection, replay, and compaction boundaries are finalized.

- npm: [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log)
- source: [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- core package: [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- codec package: [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec)
- license: MIT

## Intended Scope

When this package graduates from placeholder status, it is expected to contain:

- append-only event log records and operation streams;
- projection and replay helpers for Frontier patches;
- snapshots, checkpoints, and compaction policies;
- durable metadata, cursors, and as-of traversal;
- codecs for event batches and storage-friendly segments.

It should sit above `@shapeshift-labs/frontier` and likely use `@shapeshift-labs/frontier-codec` for transport/storage formats. It should stay separate from CRDT sync providers, rich text, logging/telemetry sinks, and normalized state caches.

## Current Status

Use [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier) for the stable JSON diff/apply core and [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec) for patch transport codecs.

The event-log package is reserved only. No runtime API is exported yet.

## Package Family

Published or active packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier)
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec)
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation)

Reserved future packages:

- `@shapeshift-labs/frontier-engine`
- `@shapeshift-labs/frontier-state`
- `@shapeshift-labs/frontier-crdt`
- `@shapeshift-labs/frontier-crdt-sync`
- `@shapeshift-labs/frontier-richtext`
- `@shapeshift-labs/frontier-logging`
- `@shapeshift-labs/frontier-state-cache`
- `@shapeshift-labs/frontier-schema`

## License

MIT. See [LICENSE](./LICENSE).
