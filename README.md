# Frontier Event Log

Bounded in-memory event logs, replay cursors, key compaction, and Frontier patch events.

This package sits beside [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier), the small JSON diff/apply core package. It keeps event replay, cursor ownership, retention, and compaction out of state/cache packages while still using core JSON clone and patch types.

- npm: [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log)
- source: [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- license: MIT

## Related Packages

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): core JSON diff/apply primitives used by patch events.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): shared query-key, selector path, condition, identity, and table-schema primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): planned diff engine and adaptive profiles.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): patch-routed app-state subscriptions and maintained views.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): normalized query-result cache; related to event-log but intentionally not a dependency.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): schema/profile helpers and CloudEvent envelopes.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): opt-in structured logging and telemetry; related to event-log but intentionally separate.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): explicit mutation and selector plans.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)

## Install

```sh
npm install @shapeshift-labs/frontier @shapeshift-labs/frontier-event-log
```

## Usage

```ts
import { diff } from '@shapeshift-labs/frontier';
import { appendPatchEvent, createEventLog } from '@shapeshift-labs/frontier-event-log';

const log = createEventLog({
  capacity: 1000,
  compactByKey: true,
  dropTombstones: true
});

log.append({
  key: 'todo:a',
  value: { type: 'todo.updated', id: 'a', done: true }
});

const patch = diff(
  { todos: [{ id: 'a', done: false }] },
  { todos: [{ id: 'a', done: true }] },
  { arrayKey: 'id' }
);

appendPatchEvent(log, patch, {
  key: 'todos',
  metadata: { source: 'cache-write' }
});

const replay = log.read(0, { limit: 32 });
console.log(replay.records, replay.cursor);
```

## API

```ts
import {
  appendPatchEvent,
  createEventLog,
  type EventLog,
  type EventLogConsumer,
  type EventLogCursor,
  type EventLogRecord,
  type PatchEventLogValue
} from '@shapeshift-labs/frontier-event-log';
```

### `createEventLog(options?)`

Creates an in-memory log with monotonically increasing offsets.

Useful options:

- `capacity`: maximum retained record count.
- `discard`: `oldest` drops old records when full; `new` rejects new appends.
- `compactByKey`: enables key-based compaction.
- `compactOnAppend`: compacts after each append when `compactByKey` is enabled.
- `dropTombstones`: removes latest `null` keyed records during compaction.
- `initialOffset`: starting offset.
- `now`: timestamp supplier for deterministic tests.

### Appending And Reading

- `log.append(input)` appends or throws if rejected.
- `log.tryAppend(input)` returns `{ accepted, record?, reason? }`.
- `log.appendBatch(inputs, { maxRecords?, maxBytes? })` appends a bounded batch.
- `log.read(cursor?, { limit?, maxBytes? })` returns cloned records plus a cursor.
- `log.clear()` removes retained records without resetting the next offset.

### Consumers

```ts
const consumer = log.createConsumer('worker-a');
const result = consumer.read({ limit: 100 });
consumer.ack(result.cursor);
```

Consumers own a read cursor and a committed cursor. They are useful for replay windows, durable checkpoints, and independent application workers.

### Patch Events

```ts
appendPatchEvent(log, patch, {
  key: 'doc:1',
  metadata: { actor: 'alice' }
});
```

Patch events store `{ kind: 'patch', patch, metadata? }` values in the log. They are ordinary event-log records and can be read, compacted, or retained like any other keyed event.

## Subpath Imports

```ts
import { createEventLog } from '@shapeshift-labs/frontier-event-log';
import { createEventLog as createEventLogSubpath } from '@shapeshift-labs/frontier-event-log/event-log';
```

Both imports expose the same event-log API.

## Package Scope

This package owns:

- in-memory event logs,
- append batching and bounded replay windows,
- consumer cursors and acknowledgements,
- capacity retention policies,
- keyed compaction and tombstone dropping,
- Frontier patch event records.

It does not own:

- diff/apply primitives,
- binary patch codecs,
- app-state subscriptions,
- normalized query caches,
- structured telemetry sinks,
- CRDT documents, branches, sync, awareness, or rich text.

## TypeScript

The package ships ESM JavaScript plus `.d.ts` declarations for the root export and `./event-log` subpath. The package-local TypeScript source lives in `src/` and compiles directly to `dist/`.

## Validation

```sh
npm test
npm run fuzz
npm run bench
npm run pack:dry
```

The package test suite covers root and subpath imports, append/read behavior, clone isolation, retention policies, keyed compaction, batch limits, consumers, patch events, and randomized operation sequences.

## Benchmarks

Run the package-local benchmark:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 9 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| Append keyed JSON event | 5.61 us | 10.17 us |
| Read replay window, 32 records | 260.19 us | 319.01 us |
| Consumer read and ack | 57.61 us | 83.99 us |
| Compact keyed log, 1k records | 162.08 us | 168.42 us |
| Append Frontier patch event | 2.32 us | 3.08 us |

These are Frontier-only package measurements, not competitor comparisons.

## License

MIT. See [LICENSE](./LICENSE).
