import assert from 'node:assert';
import { applyPatch, diff } from '@shapeshift-labs/frontier';
import {
  applyPatchEventRecord,
  appendPatchEvent,
  appendModelChosenEvent,
  appendModelOutcomeEvent,
  appendRsiRecommendationEvent,
  appendTournamentObservationEvent,
  createEventLog,
  createEventLogCheckpoint,
  createEventLogReplayStorage,
  diffBetweenTimes,
  filterModelRoutingFeedbackEvents,
  stateAtTime,
  replayEventLog,
  summarizeAgentReplay,
  summarizeAutonomousDecisionReplay
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
  const log = createEventLog({ compactByKey: true, compactOnAppend: true, dropTombstones: true, now: () => 1 });
  log.appendBatch(Array.from({ length: 32 }, (_, i) => ({
    key: 'entity:' + (i & 7),
    value: { revision: i }
  })));
  const records = log.read(0).records;
  assert.strictEqual(records.length, 8);
  assert.deepStrictEqual(records.map((record) => record.value.revision), [24, 25, 26, 27, 28, 29, 30, 31]);
  assert.strictEqual(log.getStats().compacted, 24);
}

{
  const scheduled = [];
  const scheduler = {
    schedule(task) {
      scheduled.push(task);
      return task;
    },
    run() {
      while (scheduled.length !== 0) scheduled.shift().run();
    }
  };
  const log = createEventLog({ compactByKey: true, compactOnAppend: true, scheduler });
  log.append({ key: 'a', value: { version: 1 } });
  log.append({ key: 'a', value: { version: 2 } });
  log.append({ key: 'b', value: { version: 1 } });
  assert.strictEqual(scheduled.length, 1);
  assert.strictEqual(scheduled[0].type, 'frontier.event-log.compact');
  assert.strictEqual(log.read(0).records.length, 3);
  scheduler.run();
  assert.deepStrictEqual(log.read(0).records.map((record) => record.value.version), [2, 1]);
  assert.strictEqual(log.getStats().compacted, 1);
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
  const log = createEventLog({ now: () => 10 });
  log.append({ value: { delta: 1 } });
  log.append({ value: { delta: 2 } });
  const checkpoint = createEventLogCheckpoint(log, { total: 3 }, { timestamp: 11, metadata: { label: 'after-two' } });
  log.append({ value: { delta: 4 } });
  log.append({ value: { delta: 5 } });
  const replayed = replayEventLog(log, checkpoint, (state, record) => ({
    total: state.total + record.value.delta
  }));
  assert.deepStrictEqual(replayed.state, { total: 12 });
  assert.strictEqual(replayed.replayed, 2);
  assert.deepStrictEqual(replayed.cursor, { offset: 4 });
  assert.strictEqual(log.truncateBefore(checkpoint.cursor), 2);
  assert.strictEqual(log.read(0).truncated, true);
  assert.deepStrictEqual(log.read(0).records.map((record) => record.value.delta), [4, 5]);
}

{
  const log = createEventLog();
  log.append({ value: { type: 'agent.started', id: 'agent-a' } });
  log.append({ value: { kind: 'human.question', id: 'q1' } });
  log.append({ value: { type: 'swarm.decision', id: 'd1' } });
  log.append({ value: { event: 'merge.applied', id: 'bundle-a' } });
  log.append({ value: { status: 'finished', id: 'agent-a' } });
  log.append({ value: { type: 'agent.failed', id: 'agent-b' } });
  log.append({ value: { type: 'trace.sample', id: 'ignored' } });

  const summary = summarizeAgentReplay(log, { batchSize: 2 });
  assert.deepStrictEqual({
    started: summary.started,
    finished: summary.finished,
    failed: summary.failed,
    question: summary.question,
    decision: summary.decision,
    applied: summary.applied
  }, {
    started: 1,
    finished: 1,
    failed: 1,
    question: 1,
    decision: 1,
    applied: 1
  });
  assert.strictEqual(summary.records, 7);
  assert.strictEqual(summary.matchedRecords, 6);
  assert.deepStrictEqual(summary.cursor, { offset: 7 });
  assert.strictEqual(summary.truncated, false);

  const custom = summarizeAgentReplay(log, {
    classify(record) {
      return record.value.id === 'bundle-a' ? ['decision', 'applied'] : null;
    }
  });
  assert.strictEqual(custom.decision, 1);
  assert.strictEqual(custom.applied, 1);
  assert.strictEqual(custom.matchedRecords, 1);
}

{
  const log = createEventLog();
  log.append({
    value: {
      type: 'autonomous-decision',
      status: 'rerun',
      queueSubject: 'queue:alpha',
      queueSubjectAliases: ['job:alpha', 'task:alpha'],
      reason: 'rerun against head'
    }
  });
  log.append({
    value: {
      kind: 'autonomous-decision',
      event: 'committed',
      jobId: 'job:alpha',
      queueKeys: ['queue:alpha', 'task:alpha'],
      reason: 'applied after rerun'
    }
  });
  log.append({
    value: {
      type: 'autonomous-decision',
      status: 'human-blocked',
      queueSubject: 'queue:beta',
      queueSubjectAliases: ['job:beta'],
      reason: 'needs human answer'
    }
  });

  const summary = summarizeAutonomousDecisionReplay(log);
  assert.strictEqual(summary.records, 3);
  assert.strictEqual(summary.matchedRecords, 3);
  assert.strictEqual(summary.rerun, 1);
  assert.strictEqual(summary.committed, 1);
  assert.strictEqual(summary.humanBlocked, 1);
  assert.strictEqual(summary.terminalRecords, 1);
  assert.strictEqual(summary.openRecords, 2);
  assert.strictEqual(summary.subjects.length, 2);
  assert.strictEqual(summary.byAlias['job:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.strictEqual(summary.byAlias['task:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.deepStrictEqual(summary.byQueueSubject['queue:alpha'].queueSubjectAliases, ['job:alpha', 'queue:alpha', 'task:alpha']);
  assert.strictEqual(summary.byQueueSubject['queue:alpha'].status, 'committed');
  assert.strictEqual(summary.byQueueSubject['queue:alpha'].terminalStatus, 'committed');
  assert.strictEqual(summary.latestTerminalByQueueSubject['queue:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.strictEqual(summary.latestOpenByQueueSubject['queue:beta'].status, 'human-blocked');
  assert.strictEqual(summary.latestOpenByQueueSubject['queue:beta'].terminalStatus, null);
}

{
  const log = createEventLog();
  const chosen = appendModelChosenEvent(log, {
    taskKind: 'routing-feedback',
    model: 'gpt-5.4-mini',
    reason: 'best latency/cost fit'
  });
  appendModelOutcomeEvent(log, {
    taskKind: 'routing-feedback',
    model: 'gpt-5.4-mini',
    outcome: 'accepted'
  });
  appendTournamentObservationEvent(log, {
    taskKind: 'routing-feedback',
    model: 'gpt-5.4-mini',
    observation: 'won head-to-head against gpt-4.1'
  });
  appendRsiRecommendationEvent(log, {
    taskKind: 'routing-feedback',
    model: 'gpt-4.1',
    recommendation: 'reroute future retries to gpt-5.4-mini'
  });

  chosen.value.reason = 'mutated after append';
  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'model.chosen',
    'model.outcome',
    'tournament.observation',
    'rsi.recommendation'
  ]);
  assert.strictEqual(records[0].value.reason, 'best latency/cost fit');
  assert.deepStrictEqual(
    filterModelRoutingFeedbackEvents(records, {
      taskKind: 'routing-feedback',
      model: 'gpt-5.4-mini'
    }).map((record) => record.value.kind),
    ['model.chosen', 'model.outcome', 'tournament.observation']
  );

  const replayed = replayEventLog(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind);
      return state;
    }
  );
  assert.deepStrictEqual(replayed.state, [
    'model.chosen',
    'model.outcome',
    'tournament.observation',
    'rsi.recommendation'
  ]);
}

{
  const storage = createEventLogReplayStorage({
    initialSnapshot: { todos: 1 },
    now: () => 20
  });
  storage.appendChange({ seq: 1, type: 'query' });
  storage.appendChange({ seq: 2, type: 'entity' });
  storage.appendChange({ seq: 3, type: 'query' });
  assert.deepStrictEqual(storage.load(), { todos: 1 });
  assert.deepStrictEqual(storage.readChangeLog({ limit: 0 }), []);
  assert.deepStrictEqual(storage.readChangeLog({ sinceSeq: 1, limit: 1 }).map((entry) => entry.seq), [2]);
  const checkpoint = storage.compact({ todos: 2 });
  assert.deepStrictEqual(checkpoint.snapshot, { todos: 2 });
  assert.strictEqual(storage.getStats().log.records, 0);
  const restored = createEventLogReplayStorage({ initialCheckpoint: checkpoint });
  assert.deepStrictEqual(restored.load(), { todos: 2 });
  storage.appendChange({ seq: 4, type: 'query' });
  assert.deepStrictEqual(storage.readChangeLog().map((entry) => entry.seq), [4]);
  assert.deepStrictEqual(storage.getCheckpoint().cursor, checkpoint.cursor);
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

{
  let now = 100;
  const log = createEventLog({ now: () => now++ });
  const base = { count: 0, todos: [] };
  const checkpoint = createEventLogCheckpoint(log, base, { timestamp: 99 });
  const states = [base];
  let current = base;
  for (let i = 1; i <= 4; i++) {
    const next = { count: i, todos: [{ id: 'a', done: i >= 3 }] };
    appendPatchEvent(log, diff(current, next, { arrayKey: 'id' }), { timestamp: 99 + i });
    states[states.length] = next;
    current = next;
  }

  const atOffset = stateAtTime(log, checkpoint, applyPatchEventRecord, { at: 2 });
  assert.deepStrictEqual(atOffset.state, states[2]);
  assert.deepStrictEqual(atOffset.cursor, { offset: 2 });
  assert.strictEqual(atOffset.replayed, 2);

  const atTimestamp = stateAtTime(log, checkpoint, applyPatchEventRecord, { at: { timestamp: 102 } });
  assert.deepStrictEqual(atTimestamp.state, states[3]);
  assert.deepStrictEqual(atTimestamp.cursor, { offset: 3 });

  const temporalDiff = diffBetweenTimes(log, checkpoint, applyPatchEventRecord, { from: 1, to: 4 });
  assert.deepStrictEqual(temporalDiff.before, states[1]);
  assert.deepStrictEqual(temporalDiff.after, states[4]);
  assert.deepStrictEqual(applyPatch(temporalDiff.before, temporalDiff.patch, { cloneValues: true }), temporalDiff.after);
  assert.strictEqual(temporalDiff.from.replayed, 1);
  assert.strictEqual(temporalDiff.to.replayed, 3);

  assert.throws(
    () => stateAtTime(log, checkpoint, applyPatchEventRecord, { at: { timestamp: 90 } }),
    /precedes checkpoint timestamp/
  );
  assert.throws(
    () => diffBetweenTimes(log, checkpoint, applyPatchEventRecord, { from: 3, to: 2 }),
    /end precedes start/
  );
  const lenient = stateAtTime(log, checkpoint, applyPatchEventRecord, { at: { timestamp: 90 }, strict: false });
  assert.strictEqual(lenient.truncated, true);
  assert.deepStrictEqual(lenient.state, base);
}

console.log('frontier event-log smoke passed');
