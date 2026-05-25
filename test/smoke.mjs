import assert from 'node:assert';
import { diff } from '@shapeshift-labs/frontier';
import {
  appendPatchEvent,
  createEventLog
} from '../dist/index.js';
import { createEventLog as createEventLogSubpath } from '../dist/event-log.js';

assert.strictEqual(createEventLogSubpath, createEventLog);

{
  let now = 100;
  const log = createEventLog({ now: () => now++ });
  const first = log.append({ key: 'a', value: { value: 1 } });
  const second = log.append({ key: 'b', value: { value: 2 }, headers: { source: 'unit' } });

  assert.strictEqual(first.offset, 0);
  assert.strictEqual(second.offset, 1);
  assert.strictEqual(log.highWatermark, 1);
  assert.deepStrictEqual(log.read(0).records.map((record) => record.value.value), [1, 2]);
  assert.deepStrictEqual(log.read({ offset: 1 }, { limit: 1 }).records.map((record) => record.key), ['b']);
  assert.strictEqual(log.getStats().appended, 2);

  first.value.value = 99;
  assert.strictEqual(log.read(0).records[0].value.value, 1);
}

{
  const log = createEventLog({ capacity: 2, now: () => 1 });
  log.append({ value: 'a' });
  log.append({ value: 'b' });
  log.append({ value: 'c' });

  const replay = log.read(0);
  assert.strictEqual(replay.truncated, true);
  assert.strictEqual(replay.firstOffset, 1);
  assert.deepStrictEqual(replay.records.map((record) => record.value), ['b', 'c']);
  assert.strictEqual(log.getStats().dropped, 1);
}

{
  const log = createEventLog({ capacity: 1, discard: 'new' });
  assert.strictEqual(log.tryAppend({ value: 'a' }).accepted, true);
  const rejected = log.tryAppend({ value: 'b' });
  assert.strictEqual(rejected.accepted, false);
  assert.strictEqual(rejected.reason, 'capacity');
  assert.throws(() => log.append({ value: 'b' }), /capacity/);
  assert.deepStrictEqual(log.read(0).records.map((record) => record.value), ['a']);
}

{
  const log = createEventLog({ compactByKey: true, dropTombstones: true });
  log.append({ key: 'a', value: { version: 1 } });
  log.append({ key: 'b', value: { version: 1 } });
  log.append({ key: 'a', value: { version: 2 } });
  log.append({ key: 'c', value: null });
  log.append({ key: 'c', value: null });

  assert.strictEqual(log.compact(), 3);
  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.key), ['b', 'a']);
  assert.deepStrictEqual(records.map((record) => record.value.version), [1, 2]);
  assert.strictEqual(log.read(0).truncated, true);
  assert.strictEqual(log.getStats().compacted, 3);
}

{
  const log = createEventLog();
  const batch = log.appendBatch([
    { value: { id: 1 } },
    { value: { id: 2 } },
    { value: { id: 3 } }
  ], { maxRecords: 2 });
  assert.strictEqual(batch.records.length, 2);
  assert.strictEqual(batch.rejected, 1);
  assert.deepStrictEqual(log.read(0, { maxBytes: 1 }).records, []);
  assert.deepStrictEqual(log.read(0, { limit: 10 }).records.map((record) => record.value.id), [1, 2]);
}

{
  const log = createEventLog();
  for (let i = 0; i < 5; i++) log.append({ value: { i } });
  const consumer = log.createConsumer('agent');
  const firstRead = consumer.read({ limit: 2 });
  assert.deepStrictEqual(firstRead.records.map((record) => record.value.i), [0, 1]);
  assert.deepStrictEqual(consumer.cursor, { offset: 2 });
  assert.deepStrictEqual(consumer.ack(), { offset: 2 });
  assert.deepStrictEqual(consumer.committed, { offset: 2 });
  consumer.seek(4);
  assert.deepStrictEqual(consumer.read({ limit: 10 }).records.map((record) => record.value.i), [4]);
  assert.strictEqual(consumer.lag(), 0);
}

{
  const log = createEventLog();
  const before = { rows: [{ id: 'a', score: 1 }] };
  const after = { rows: [{ id: 'a', score: 2 }] };
  const patch = diff(before, after, { arrayKey: 'id' });
  appendPatchEvent(log, patch, { key: 'doc:1', metadata: { source: 'unit' } });
  const event = log.read(0).records[0];
  assert.strictEqual(event.key, 'doc:1');
  assert.strictEqual(event.value.kind, 'patch');
  assert.deepStrictEqual(event.value.patch, patch);
  assert.strictEqual(event.value.metadata.source, 'unit');
}

console.log('frontier event-log smoke passed');
