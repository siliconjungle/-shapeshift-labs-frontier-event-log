# Frontier Event Log

Bounded in-memory event logs, replay cursors, key compaction, and Frontier patch events.

This package sits beside [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier), the small JSON diff/apply core package. It keeps event replay, cursor ownership, retention, and compaction out of state/cache packages while still using core JSON clone and patch types.

- npm: [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log)
- source: [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- license: MIT

## Related Packages

The published Frontier package family is generated from one shared package catalog so READMEs stay in sync across packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): Core JSON diff/apply, compact patch tuples, JSON Pointer, equality, clone, validation, Unicode helpers.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): Shared query-key, selector path, condition, entity identity, and table-shape primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): Patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): Stateful planned diff engine, adaptive profiles, schema plans, and engine-level history helpers.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): Patch-routed app-state subscriptions, owned commits, maintained views, and path mapping.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): Normalized query-result cache with entity/query watchers, persistence, change logs, optimistic layers, and mutation bridge.
- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): JSON Schema validation, Frontier profile generation, CloudEvent envelopes, and query/table schema helpers.
- [`@shapeshift-labs/frontier-scheduler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scheduler): Deterministic work scheduling, lanes, cancellation, backpressure, frame policies, replay snapshots, and work graphs.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): Opt-in structured logging, browser telemetry, file sinks, exporters, benchmark traces, and Frontier patch/update summaries.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): Explicit mutation and selector plans compiled to Frontier patches or CRDT operations.
- [`@shapeshift-labs/frontier-virtual`](https://www.npmjs.com/package/@shapeshift-labs/frontier-virtual): DOM-neutral virtualization, layout providers, range materialization, grids, spatial culling, frustum culling, and serializable layout state.
- [`@shapeshift-labs/frontier-dom`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dom): Patch-native DOM and host renderer bindings, manifest hydration, JSX runtime/compiler helpers, SSR, devtools, and logging bridges.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): Native CRDT documents, update tooling, awareness, branches, conflict introspection, version frames, and undo.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): CRDT sync endpoints, repo/storage/provider contracts, document URLs, local networks, model checking, forensics, and text binding contracts.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket client/server transports for Frontier CRDT sync providers.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store hooks and adapters for Frontier state, cache, and CRDT surfaces.
- [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext): Rich text Delta normalization/application, marks, embeds, ranges, and cursor/selection transforms for local editor integrations.
- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): Shared realtime command, tick, snapshot, prediction, reconciliation, interpolation, rollback, message, and delta primitives.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): Authoritative realtime room, tick, command validation, rate-limit, session, and snapshot-history runtime.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket client, wire, and Node room-server transport for Frontier realtime.
- [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game): Game-facing entity, component, player, room, ownership, spatial interest, rollback, physics, and replication helpers above realtime.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- [`siliconjungle/-shapeshift-labs-frontier-scheduler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scheduler)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-virtual`](https://github.com/siliconjungle/-shapeshift-labs-frontier-virtual)
- [`siliconjungle/-shapeshift-labs-frontier-dom`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dom)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- [`siliconjungle/-shapeshift-labs-frontier-realtime`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-server)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)

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
  applyPatchEventRecord,
  appendPatchEvent,
  createEventLogCheckpoint,
  createEventLog,
  createEventLogReplayStorage,
  diffBetweenTimes,
  replayEventLog,
  stateAtTime,
  type EventLog,
  type EventLogCheckpoint,
  type EventLogConsumer,
  type EventLogCursor,
  type EventLogRecord,
  type EventLogReplayStorage,
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
- `scheduler`: optional structural scheduler for queued append compaction.
- `initialOffset`: starting offset.
- `now`: timestamp supplier for deterministic tests.

### Appending And Reading

- `log.append(input)` appends or throws if rejected.
- `log.tryAppend(input)` returns `{ accepted, record?, reason? }`.
- `log.appendBatch(inputs, { maxRecords?, maxBytes? })` appends a bounded batch.
- `log.read(cursor?, { limit?, maxBytes? })` returns cloned records plus a cursor.
- `log.truncateBefore(cursor)` drops retained records before a checkpoint cursor.
- `log.clear()` removes retained records without resetting the next offset.

### Consumers

```ts
const consumer = log.createConsumer('worker-a');
const result = consumer.read({ limit: 100 });
consumer.ack(result.cursor);
```

Consumers own a read cursor and a committed cursor. They are useful for replay windows, durable checkpoints, and independent application workers.

### Checkpoints And Replay

```ts
const checkpoint = createEventLogCheckpoint(log, { count: 2 });
const result = replayEventLog(log, checkpoint, (state, record) => ({
  count: state.count + Number(record.value.delta || 0)
}));
```

`createEventLogCheckpoint()` captures an application snapshot plus an event-log cursor. `replayEventLog()` resumes from that cursor in bounded batches and returns the replayed state, cursor, replay count, and a fresh checkpoint. `createEventLogReplayStorage()` provides the same snapshot-plus-bounded-change-log shape used by state-cache persistence without making state-cache depend on event-log.

### Temporal State And Diff

`stateAtTime()` materializes state at an offset, cursor, high-watermark, or timestamp by replaying from a checkpoint. `diffBetweenTimes()` materializes two temporal states and returns a Frontier patch between them. For patch-event logs, `applyPatchEventRecord()` is the reducer.

```ts
const atCursor = stateAtTime(log, checkpoint, applyPatchEventRecord, {
  at: { offset: 128 }
});

const change = diffBetweenTimes(log, checkpoint, applyPatchEventRecord, {
  from: { offset: 64 },
  to: { timestamp: Date.now() }
});
```

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
- snapshot checkpoints and bounded replay helpers,
- temporal state-at-time and diff-between-times helpers,
- generic replay storage for snapshot plus change-log adapters,
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

The package test suite covers root and subpath imports, append/read behavior, clone isolation, retention policies, keyed compaction, batch limits, consumers, checkpoint replay, temporal state/diff, replay storage, patch events, and randomized operation sequences.

## Benchmarks

Run the package-local benchmark:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 9 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| Append keyed JSON event | 3.79 us | 4.68 us |
| Read replay window, 32 records | 1.64 us | 2.06 us |
| Consumer read and ack | 0.44 us | 0.55 us |
| Compact keyed log, 1k records | 181.84 us | 232.58 us |
| Append batch compactOnAppend, 1k records | 107.28 us | 154.82 us |
| Replay from checkpoint, 64 records | 26.63 us | 28.06 us |
| State at offset, 64 patch events | 12.77 us | 12.95 us |
| Diff between offsets, 64 patch events | 21.77 us | 22.49 us |
| Replay storage append/read checkpoint | 11.19 us | 12.72 us |
| Append Frontier patch event | 2.17 us | 2.74 us |

These are Frontier-only package measurements, not competitor comparisons.
Replay and consumer fixtures use preseeded retained logs so the timed work is read/cursor behavior, not fixture construction.

## License

MIT. See [LICENSE](./LICENSE).
