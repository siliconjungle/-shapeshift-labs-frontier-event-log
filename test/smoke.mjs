import assert from 'node:assert';
import { applyPatch, diff } from '@shapeshift-labs/frontier';
import {
  applyPatchEventRecord,
  appendAutonomousDecisionAppliedEvent,
  appendAutonomousDecisionCommittedEvent,
  appendAutonomousDecisionConflictBlockedEvent,
  appendAutonomousDecisionHumanBlockedEvent,
  appendAutonomousDecisionNoChangeEvent,
  appendAutonomousDecisionRejectedEvent,
  appendAutonomousDecisionRerunEvent,
  appendContinuousPoolHumanBlockedEvent,
  appendContinuousPoolBundleCollectedEvent,
  appendContinuousPoolDecisionWrittenEvent,
  appendContinuousPoolDrainedEvent,
  appendContinuousPoolWorkerDrainedEvent,
  appendContinuousPoolWorkerFailedEvent,
  appendContinuousPoolWorkerHeartbeatEvent,
  appendContinuousPoolPatchAppliedEvent,
  appendContinuousPoolQueueRefilledEvent,
  appendContinuousPoolStartedEvent,
  appendContinuousPoolWorkerScheduledEvent,
  appendContinuousPoolWorkerStartedEvent,
  appendContinuousPoolWorkerFinishedEvent,
  appendContinuousPoolWorkerLeasedEvent,
  appendCoordinatorGateFailedEvent,
  appendCoordinatorGatePassedEvent,
  appendCoordinatorGateSelectedEvent,
  appendCoordinatorGateSkippedEvent,
  appendCoordinatorGateStartedEvent,
  appendBundleExpectedEvent,
  appendBundleWrittenEvent,
  appendPatchGeneratedEvent,
  appendPatchMissingEvent,
  appendNoChangeEvidenceEvent,
  appendCollectorSynthesizedEvent,
  appendBundleRejectedEvent,
  appendPatchEvent,
  appendQuestionAskedEvent,
  appendQuestionAnsweredEvent,
  appendQuestionConsumedEvent,
  appendSemanticLeaseAcquiredEvent,
  appendSemanticLeaseReleasedEvent,
  appendSemanticMergePromotedEvent,
  appendSemanticMergeSupersededEvent,
  appendSemanticSliceAppliedEvent,
  appendSemanticSliceClaimedEvent,
  appendModelChosenEvent,
  appendModelOutcomeEvent,
  appendRsiRecommendationEvent,
  appendTournamentObservationEvent,
  createEventLog,
  createEventLogCheckpoint,
  createEventLogReplayStorage,
  diffBetweenTimes,
  filterModelRoutingFeedbackEvents,
  filterSemanticChangeStreamEvents,
  stateAtTime,
  replayEventLog,
  replayAutonomousDecisionRecords,
  replaySemanticChangeStreamEvents,
  summarizeAgentReplay,
  summarizeAutonomousDecisionReplay,
  summarizeQuestionLifecycleReplay
} from '../dist/index.js';
import {
  createEventLog as createEventLogSubpath,
  replaySemanticChangeStreamEvents as replaySemanticChangeStreamEventsSubpath
} from '../dist/event-log.js';

assert.strictEqual(createEventLogSubpath, createEventLog);
assert.strictEqual(replaySemanticChangeStreamEventsSubpath, replaySemanticChangeStreamEvents);

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
  const asked = appendQuestionAskedEvent(log, {
    questionCode: 'question:route-me',
    taskId: 'task:route-me',
    jobId: 'job:route-me',
    answerText: 'open me'
  }, { timestamp: 1 });
  asked.value.questionId = 'mutated';
  assert.strictEqual(log.read(0).records[0].value.questionId, 'question:route-me');
  assert.strictEqual(log.read(0).records[0].value.kind, 'question.opened');

  appendQuestionAnsweredEvent(log, {
    questionCode: 'question:route-me',
    taskId: 'task:route-me',
    jobId: 'job:route-me',
    answerText: 'use the parent continuation',
    continuationTarget: 'continue:parent'
  }, { timestamp: 2 });
  appendQuestionConsumedEvent(log, {
    questionCode: 'question:route-me',
    taskId: 'task:route-me',
    jobId: 'job:route-me',
    answerText: 'use the parent continuation',
    continuationTarget: 'continue:parent',
    unresolvedReason: 'continuation routed'
  }, { timestamp: 3 });
  appendQuestionAskedEvent(log, {
    questionCode: 'question:pending',
    taskId: 'task:pending',
    jobId: 'job:pending',
    answerText: 'ask later'
  }, { timestamp: 4 });
  appendQuestionAnsweredEvent(log, {
    questionCode: 'question:pending',
    taskId: 'task:pending',
    jobId: 'job:pending',
    answerText: 'waiting on review'
  }, { timestamp: 5 });

  const summary = summarizeQuestionLifecycleReplay(log);
  assert.strictEqual(summary.records, 5);
  assert.strictEqual(summary.matchedRecords, 5);
  assert.strictEqual(summary.questionCount, 2);
  assert.strictEqual(summary.opened, 2);
  assert.strictEqual(summary.answered, 2);
  assert.strictEqual(summary.consumed, 1);
  assert.strictEqual(summary.terminalRecords, 1);
  assert.strictEqual(summary.openRecords, 4);
  assert.deepStrictEqual(summary.questions.map((question) => question.questionId), ['question:pending', 'question:route-me']);
  assert.deepStrictEqual(summary.byQuestionId['question:route-me'].questionIds, ['job:route-me', 'question:route-me', 'task:route-me']);
  assert.strictEqual(summary.byAlias['task:route-me'], summary.byQuestionId['question:route-me']);
  assert.strictEqual(summary.byAlias['job:route-me'], summary.byQuestionId['question:route-me']);
  assert.strictEqual(summary.byQuestionId['question:route-me'].status, 'consumed');
  assert.strictEqual(summary.byQuestionId['question:route-me'].terminalStatus, 'consumed');
  assert.strictEqual(summary.byQuestionId['question:route-me'].terminalRecord.value.continuationTarget, 'continue:parent');
  assert.strictEqual(summary.answeredQuestions.length, 1);
  assert.strictEqual(summary.answeredQuestions[0].questionId, 'question:pending');
  assert.strictEqual(summary.latestAnsweredByQuestionId['question:pending'], summary.byQuestionId['question:pending']);
  assert.strictEqual(summary.consumedQuestions.length, 1);
  assert.strictEqual(summary.latestConsumedByQuestionId['question:route-me'], summary.byQuestionId['question:route-me']);
}

{
  const log = createEventLog();
  const rerun = appendAutonomousDecisionRerunEvent(log, {
    queueSubject: 'queue:alpha',
    queueSubjectAliases: ['job:alpha', 'task:alpha'],
    changedPaths: ['packages/frontier-event-log/src/event-log.ts'],
    verificationSummary: { passed: false, retryable: true },
    sourceRun: 'run:source-rerun',
    decisionReason: 'rerun against head'
  }, { timestamp: 20 });
  const conflictBlocked = appendAutonomousDecisionConflictBlockedEvent(log, {
    queueSubject: 'queue:beta',
    queueSubjectAliases: ['job:beta'],
    changedPaths: ['packages/frontier-event-log/src/index.ts'],
    verificationSummary: { passed: false, blocked: 'merge conflict' },
    sourceRun: 'run:source-conflict',
    decisionReason: 'blocked by conflict'
  }, { timestamp: 10 });
  const committed = appendAutonomousDecisionCommittedEvent(log, {
    queueSubject: 'queue:alpha',
    queueSubjectAliases: ['job:alpha'],
    changedPaths: ['packages/frontier-event-log/src/event-log.ts'],
    verificationSummary: { passed: true, checks: 11 },
    sourceRun: 'run:source-committed',
    decisionReason: 'queued for commit'
  }, { timestamp: 30 });
  const applied = appendAutonomousDecisionAppliedEvent(log, {
    queueSubject: 'queue:delta',
    queueSubjectAliases: ['job:delta'],
    changedPaths: ['packages/frontier-event-log/src/event-log.ts'],
    verificationSummary: { passed: true, checks: 12 },
    sourceRun: 'run:source-applied',
    decisionReason: 'tests passed'
  }, { timestamp: 30 });
  const humanBlocked = appendAutonomousDecisionHumanBlockedEvent(log, {
    queueSubject: 'queue:gamma',
    queueSubjectAliases: ['job:gamma'],
    changedPaths: ['packages/frontier-event-log/test/smoke.mjs'],
    verificationSummary: { passed: false, blocked: 'human' },
    sourceRun: 'run:source-human',
    decisionReason: 'needs human answer'
  }, { timestamp: 40 });
  const rejected = appendAutonomousDecisionRejectedEvent(log, {
    queueSubject: 'queue:epsilon',
    queueSubjectAliases: ['job:epsilon'],
    changedPaths: ['packages/frontier-event-log/README.md'],
    verificationSummary: { passed: false, checks: 3 },
    sourceRun: 'run:source-rejected',
    decisionReason: 'verification failed'
  }, { timestamp: 50 });
  const noChange = appendAutonomousDecisionNoChangeEvent(log, {
    queueSubject: 'queue:zeta',
    queueSubjectAliases: ['job:zeta'],
    changedPaths: [],
    verificationSummary: { passed: true, changedPaths: 0 },
    sourceRun: 'run:source-no-change',
    decisionReason: 'nothing changed'
  }, { timestamp: 60 });

  assert.deepStrictEqual(Object.keys(applied.value).sort(), Object.keys(rejected.value).sort());
  assert.deepStrictEqual(applied.value.changedPaths, ['packages/frontier-event-log/src/event-log.ts']);
  assert.strictEqual(applied.key, undefined);
  assert.strictEqual(rejected.key, undefined);
  assert.strictEqual(noChange.value.kind, 'no-change');
  assert.strictEqual(noChange.key, undefined);
  assert.strictEqual(
    applied.value.id,
    appendAutonomousDecisionAppliedEvent(createEventLog(), {
      queueSubject: 'queue:delta',
      queueSubjectAliases: ['job:delta'],
      changedPaths: ['packages/frontier-event-log/src/event-log.ts'],
      verificationSummary: { passed: true, checks: 12 },
      sourceRun: 'run:source-applied',
      decisionReason: 'tests passed'
    }, { timestamp: 999 }).value.id
  );

  const replay = replayAutonomousDecisionRecords(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => state.concat(record.value.kind)
  );
  assert.deepStrictEqual(replay.state, ['conflict-blocked', 'rerun', 'committed', 'applied', 'human-blocked', 'rejected']);

  const summary = summarizeAutonomousDecisionReplay(log);
  assert.strictEqual(summary.records, 7);
  assert.strictEqual(summary.matchedRecords, 6);
  assert.strictEqual(summary.applied, 1);
  assert.strictEqual(summary.committed, 1);
  assert.strictEqual(summary.rerun, 1);
  assert.strictEqual(summary.conflictBlocked, 1);
  assert.strictEqual(summary.humanBlocked, 1);
  assert.strictEqual(summary.rejected, 1);
  assert.strictEqual(summary.terminalRecords, 3);
  assert.strictEqual(summary.openRecords, 3);
  assert.strictEqual(summary.subjects.length, 5);
  assert.strictEqual(summary.byAlias['job:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.strictEqual(summary.byAlias['task:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.deepStrictEqual(summary.byQueueSubject['queue:alpha'].queueSubjectAliases, ['job:alpha', 'queue:alpha', 'task:alpha']);
  assert.strictEqual(summary.byQueueSubject['queue:alpha'].status, 'committed');
  assert.strictEqual(summary.byQueueSubject['queue:alpha'].terminalStatus, 'committed');
  assert.strictEqual(summary.latestTerminalByQueueSubject['queue:alpha'], summary.byQueueSubject['queue:alpha']);
  assert.strictEqual(summary.latestOpenByQueueSubject['queue:beta'].status, 'conflict-blocked');
  assert.strictEqual(summary.latestOpenByQueueSubject['queue:beta'].terminalStatus, null);
  assert.strictEqual(summary.latestOpenByQueueSubject['queue:gamma'].status, 'human-blocked');
  assert.strictEqual(summary.byQueueSubject['queue:delta'].status, 'applied');
  assert.strictEqual(summary.byQueueSubject['queue:delta'].terminalStatus, 'applied');
}

{
  const log = createEventLog();
  const selected = appendCoordinatorGateSelectedEvent(log, {
    gateName: 'coordinator-root-test',
    jobId: 'job:alpha',
    taskId: 'task:alpha',
    queueSubject: 'queue:alpha',
    queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
    queueKey: 'queue:alpha',
    run: 'run:auto-drain',
    lane: 'lane:coordinator'
  }, { timestamp: 1 });
  appendCoordinatorGateStartedEvent(log, {
    gateName: 'coordinator-root-test',
    jobId: 'job:alpha',
    taskId: 'task:alpha',
    queueSubject: 'queue:alpha',
    queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
    queueKey: 'queue:alpha',
    run: 'run:auto-drain',
    lane: 'lane:coordinator'
  }, { timestamp: 2 });
  appendCoordinatorGatePassedEvent(log, {
    gateName: 'coordinator-root-test',
    jobId: 'job:alpha',
    taskId: 'task:alpha',
    queueSubject: 'queue:alpha',
    queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
    queueKey: 'queue:alpha',
    run: 'run:auto-drain',
    lane: 'lane:coordinator'
  }, { timestamp: 3 });
  appendCoordinatorGateFailedEvent(log, {
    gateName: 'coordinator-package-test',
    jobId: 'job:beta',
    taskId: 'task:beta',
    queueSubject: 'queue:beta',
    queueSubjectAliases: ['job:beta', 'queue:beta', 'task:beta'],
    queueKey: 'queue:beta',
    run: 'run:auto-drain',
    lane: 'lane:coordinator',
    reason: 'exit code 1'
  }, { timestamp: 4 });
  appendCoordinatorGateSkippedEvent(log, {
    gateName: 'coordinator-package-lint',
    jobId: 'job:gamma',
    taskId: 'task:gamma',
    queueSubject: 'queue:gamma',
    queueSubjectAliases: ['job:gamma', 'queue:gamma', 'task:gamma'],
    queueKey: 'queue:gamma',
    run: 'run:auto-drain',
    lane: 'lane:coordinator',
    reason: 'gate already satisfied'
  }, { timestamp: 5 });

  selected.value.gateName = 'mutated';
  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'gate.selected',
    'gate.started',
    'gate.passed',
    'gate.failed',
    'gate.skipped'
  ]);
  assert.deepStrictEqual(records.map((record) => record.value.status), [
    'selected',
    'started',
    'passed',
    'failed',
    'skipped'
  ]);
  assert.deepStrictEqual(records.map((record) => record.value.gateName), [
    'coordinator-root-test',
    'coordinator-root-test',
    'coordinator-root-test',
    'coordinator-package-test',
    'coordinator-package-lint'
  ]);
  assert.deepStrictEqual(records[0].value.queueSubjectAliases, ['job:alpha', 'queue:alpha', 'task:alpha']);
  assert.strictEqual(records[3].value.reason, 'exit code 1');
  assert.strictEqual(selected.value.gateName, 'mutated');

  const replayed = replayEventLog(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind + ':' + record.value.status);
      return state;
    }
  );
  assert.deepStrictEqual(replayed.state, [
    'gate.selected:selected',
    'gate.started:started',
    'gate.passed:passed',
    'gate.failed:failed',
    'gate.skipped:skipped'
  ]);
}

{
  const log = createEventLog();
  const claimed = appendSemanticSliceClaimedEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-b',
    taskId: 'task:semantic-merge',
    leaseKey: 'lease:src/apply.ts#apply',
    sliceId: 'slice:apply'
  });
  appendSemanticLeaseAcquiredEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-b',
    taskId: 'task:semantic-merge',
    leaseKey: 'lease:src/apply.ts#apply',
    leaseId: 'lease-1'
  });
  appendSemanticSliceAppliedEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-c',
    taskId: 'task:semantic-merge',
    leaseKey: 'lease:src/apply.ts#apply',
    sliceId: 'slice:apply'
  });
  appendSemanticLeaseReleasedEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-c',
    taskId: 'task:semantic-merge',
    leaseKey: 'lease:src/apply.ts#apply',
    leaseId: 'lease-1'
  });
  appendSemanticMergePromotedEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-parent',
    taskId: 'task:semantic-merge',
    promotionParent: 'lane:root',
    mergeId: 'merge-1'
  });
  appendSemanticMergeSupersededEvent(log, {
    semanticRegionKey: 'region:src/apply.ts#apply',
    sourceHead: 'head-a',
    currentHead: 'head-parent',
    taskId: 'task:semantic-merge',
    promotionParent: 'lane:root',
    mergeId: 'merge-2',
    supersedingMergeId: 'merge-3'
  });

  claimed.value.sourceHead = 'mutated';
  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'slice.claimed',
    'lease.acquired',
    'slice.applied',
    'lease.released',
    'merge.promoted',
    'merge.superseded'
  ]);
  assert.strictEqual(records[0].value.sourceHead, 'head-a');
  assert.strictEqual(records[0].value.currentHead, 'head-b');
  assert.deepStrictEqual(
    filterSemanticChangeStreamEvents(records, { semanticRegionKey: 'region:src/apply.ts#apply' }).map((record) => record.value.kind),
    [
      'slice.claimed',
      'lease.acquired',
      'slice.applied',
      'lease.released',
      'merge.promoted',
      'merge.superseded'
    ]
  );
  assert.deepStrictEqual(
    filterSemanticChangeStreamEvents(records, { leaseKey: 'lease:src/apply.ts#apply' }).map((record) => record.value.kind),
    ['slice.claimed', 'lease.acquired', 'slice.applied', 'lease.released']
  );
  assert.deepStrictEqual(
    filterSemanticChangeStreamEvents(records, { taskId: 'task:semantic-merge' }).map((record) => record.value.kind),
    [
      'slice.claimed',
      'lease.acquired',
      'slice.applied',
      'lease.released',
      'merge.promoted',
      'merge.superseded'
    ]
  );
  assert.deepStrictEqual(
    filterSemanticChangeStreamEvents(records, { promotionParent: 'lane:root' }).map((record) => record.value.kind),
    ['merge.promoted', 'merge.superseded']
  );

  const replayRegion = replaySemanticChangeStreamEvents(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind);
      return state;
    },
    { semanticRegionKey: 'region:src/apply.ts#apply' }
  );
  assert.deepStrictEqual(replayRegion.state, [
    'slice.claimed',
    'lease.acquired',
    'slice.applied',
    'lease.released',
    'merge.promoted',
    'merge.superseded'
  ]);

  const replayLease = replaySemanticChangeStreamEvents(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind);
      return state;
    },
    { leaseKey: 'lease:src/apply.ts#apply' }
  );
  assert.deepStrictEqual(replayLease.state, ['slice.claimed', 'lease.acquired', 'slice.applied', 'lease.released']);

  const replayPromotion = replaySemanticChangeStreamEvents(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind);
      return state;
    },
    { promotionParent: 'lane:root' }
  );
  assert.deepStrictEqual(replayPromotion.state, ['merge.promoted', 'merge.superseded']);
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
  const log = createEventLog({ now: () => 200 });
  const started = appendContinuousPoolStartedEvent(log, {
    run: 'run:pool-1',
    lane: 'lane:continuous',
    task: 'task:pool-1'
  });
  const leased = appendContinuousPoolWorkerLeasedEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:pool-1',
    lane: 'lane:continuous',
    leaseScope: 'lease:scope:a',
    leaseScopes: ['lease:scope:a', 'lease:scope:b']
  });
  appendContinuousPoolWorkerFinishedEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:pool-1',
    lane: 'lane:continuous',
    leaseScope: 'lease:scope:a'
  });
  appendContinuousPoolBundleCollectedEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:bundle-1',
    lane: 'lane:continuous',
    decision: 'bundle:collect'
  });
  appendContinuousPoolDecisionWrittenEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:decision-1',
    lane: 'lane:continuous',
    decision: 'decision:write',
    leaseScope: 'lease:scope:a'
  });
  appendContinuousPoolPatchAppliedEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:patch-1',
    lane: 'lane:continuous',
    decision: 'decision:apply'
  });
  appendContinuousPoolQueueRefilledEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:queue-1',
    lane: 'lane:continuous',
    decision: 'queue:refill'
  });
  appendContinuousPoolHumanBlockedEvent(log, {
    run: 'run:pool-1',
    worker: 'worker:1',
    task: 'task:block-1',
    lane: 'lane:continuous',
    decision: 'decision:human-blocked',
    leaseScope: 'lease:scope:a'
  });
  appendContinuousPoolDrainedEvent(log, {
    run: 'run:pool-1',
    lane: 'lane:continuous',
    task: 'task:pool-1'
  });

  started.value.run = 'mutated';
  leased.value.leaseScopes.push('lease:scope:c');

  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'pool.started',
    'worker.leased',
    'worker.finished',
    'bundle.collected',
    'decision.written',
    'patch.applied',
    'queue.refilled',
    'human.blocked',
    'pool.drained'
  ]);
  assert.strictEqual(records[0].value.run, 'run:pool-1');
  assert.strictEqual(records[1].value.leaseScopes.length, 2);
  assert.strictEqual(records[4].value.decision, 'decision:write');

  const replayed = replayEventLog(
    log,
    createEventLogCheckpoint(log, [], { cursor: 0 }),
    (state, record) => {
      state.push(record.value.kind);
      return state;
    }
  );
  assert.deepStrictEqual(replayed.state, [
    'pool.started',
    'worker.leased',
    'worker.finished',
    'bundle.collected',
    'decision.written',
    'patch.applied',
    'queue.refilled',
    'human.blocked',
    'pool.drained'
  ]);
}

{
  const log = createEventLog();
  const scheduled = appendContinuousPoolWorkerScheduledEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous',
    leaseScopes: ['lease:scope:a']
  });
  const started = appendContinuousPoolWorkerStartedEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous',
    leaseScope: 'lease:scope:a'
  });
  const heartbeat = appendContinuousPoolWorkerHeartbeatEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous',
    decision: 'worker:alive',
    leaseScopes: ['lease:scope:a', 'lease:scope:b']
  });
  const finished = appendContinuousPoolWorkerFinishedEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous',
    decision: 'worker:complete'
  });
  const failed = appendContinuousPoolWorkerFailedEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous',
    decision: 'worker:failed',
    leaseScope: 'lease:scope:b'
  });
  const drained = appendContinuousPoolWorkerDrainedEvent(log, {
    run: 'run:pool-2',
    worker: 'worker:2',
    task: 'task:queue-2',
    lane: 'lane:continuous'
  });

  scheduled.value.leaseScopes.push('lease:scope:c');
  heartbeat.value.leaseScopes.push('lease:scope:c');
  finished.value.decision = 'mutated';

  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'worker.scheduled',
    'worker.started',
    'worker.heartbeat',
    'worker.finished',
    'worker.failed',
    'worker.drained'
  ]);
  assert.strictEqual(records[0].value.leaseScopes.length, 1);
  assert.strictEqual(records[2].value.leaseScopes.length, 2);
  assert.strictEqual(records[3].value.decision, 'worker:complete');
  assert.strictEqual(records[4].value.decision, 'worker:failed');
  assert.strictEqual(drained.value.kind, 'worker.drained');
}

{
  const log = createEventLog();
  const expected = appendBundleExpectedEvent(log, {
    bundleId: 'bundle:1',
    run: 'run:bundle-1',
    task: 'task:bundle-1',
    lane: 'lane:bundle-events'
  }, { timestamp: 1 });
  const written = appendBundleWrittenEvent(log, {
    bundleId: 'bundle:1',
    run: 'run:bundle-1',
    task: 'task:bundle-1',
    lane: 'lane:bundle-events',
    bundlePath: 'agent-runs/bundle-1/bundle.json'
  }, { timestamp: 2 });
  const generated = appendPatchGeneratedEvent(log, {
    bundleId: 'bundle:1',
    run: 'run:bundle-1',
    task: 'task:bundle-1',
    lane: 'lane:bundle-events',
    patchPath: 'agent-runs/bundle-1/changes.patch',
    changedPaths: ['packages/frontier-event-log/src/event-log.ts']
  }, { timestamp: 3 });
  const missing = appendPatchMissingEvent(log, {
    bundleId: 'bundle:2',
    run: 'run:bundle-2',
    task: 'task:bundle-2',
    lane: 'lane:bundle-events',
    bundlePath: 'agent-runs/bundle-2/bundle.json',
    reasons: ['patch file was not produced']
  }, { timestamp: 4 });
  const noChange = appendNoChangeEvidenceEvent(log, {
    bundleId: 'bundle:3',
    run: 'run:bundle-3',
    task: 'task:bundle-3',
    lane: 'lane:bundle-events',
    evidencePaths: ['agent-runs/bundle-3/evidence.json']
  }, { timestamp: 5 });
  const synthesized = appendCollectorSynthesizedEvent(log, {
    bundleId: 'bundle:4',
    run: 'run:bundle-4',
    task: 'task:bundle-4',
    lane: 'lane:bundle-events',
    collector: 'collector:alpha'
  }, { timestamp: 6 });
  const rejected = appendBundleRejectedEvent(log, {
    bundleId: 'bundle:5',
    run: 'run:bundle-5',
    task: 'task:bundle-5',
    lane: 'lane:bundle-events',
    reasons: ['missing evidence']
  }, { timestamp: 7 });

  expected.value.bundleId = 'mutated';
  noChange.value.evidencePaths.push('agent-runs/bundle-3/mutated.json');

  const records = log.read(0).records;
  assert.deepStrictEqual(records.map((record) => record.value.kind), [
    'bundle.expected',
    'bundle.written',
    'patch.generated',
    'patch.missing',
    'no-change.evidence',
    'collector.synthesized',
    'bundle.rejected'
  ]);
  assert.deepStrictEqual(records.map((record) => record.value.decision), [
    'expected',
    'written',
    'generated',
    'missing',
    'no-change',
    'synthesized',
    'rejected'
  ]);
  assert.strictEqual(records[1].value.bundlePath, 'agent-runs/bundle-1/bundle.json');
  assert.deepStrictEqual(records[2].value.changedPaths, ['packages/frontier-event-log/src/event-log.ts']);
  assert.deepStrictEqual(records[4].value.evidencePaths, ['agent-runs/bundle-3/evidence.json']);
  assert.strictEqual(records[5].value.collector, 'collector:alpha');
  assert.deepStrictEqual(records[6].value.reasons, ['missing evidence']);
  assert.strictEqual(expected.value.bundleId, 'mutated');
  assert.strictEqual(records[0].value.bundleId, 'bundle:1');
  assert.deepStrictEqual(
    replayEventLog(
      log,
      createEventLogCheckpoint(log, [], { cursor: 0 }),
      (state, record) => {
        state.push(record.value.kind);
        return state;
      }
    ).state,
    [
      'bundle.expected',
      'bundle.written',
      'patch.generated',
      'patch.missing',
      'no-change.evidence',
      'collector.synthesized',
      'bundle.rejected'
    ]
  );
  void written;
  void generated;
  void missing;
  void synthesized;
  void rejected;
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
