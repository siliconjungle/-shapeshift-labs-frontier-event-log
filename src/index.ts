import type {
  AutonomousDecisionReplayRecordFields,
  AutonomousDecisionReplayRecordValue,
  AutonomousDecisionReplayStatus,
  EventLog,
  EventLogAppendInput,
  EventLogCursor,
  EventLogRecord
} from './event-log.ts';
import { cloneJson } from '@shapeshift-labs/frontier/clone';
import type {
  JsonObject,
  JsonValue
} from '@shapeshift-labs/frontier/types';

export {
  applyPatchEventRecord,
  appendCoordinatorGateFailedEvent,
  appendCoordinatorGatePassedEvent,
  appendCoordinatorGateSelectedEvent,
  appendCoordinatorGateSkippedEvent,
  appendCoordinatorGateStartedEvent,
  appendPatchEvent,
  appendContinuousPoolStartedEvent,
  appendContinuousPoolWorkerLeasedEvent,
  appendContinuousPoolWorkerFinishedEvent,
  appendContinuousPoolBundleCollectedEvent,
  appendContinuousPoolDecisionWrittenEvent,
  appendContinuousPoolPatchAppliedEvent,
  appendContinuousPoolQueueRefilledEvent,
  appendContinuousPoolHumanBlockedEvent,
  appendContinuousPoolDrainedEvent,
  appendBundleExpectedEvent,
  appendBundleWrittenEvent,
  appendPatchGeneratedEvent,
  appendPatchMissingEvent,
  appendNoChangeEvidenceEvent,
  appendCollectorSynthesizedEvent,
  appendBundleRejectedEvent,
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
  replayAutonomousDecisionRecords,
  summarizeAutonomousDecisionReplay,
  replaySemanticChangeStreamEvents,
  stateAtTime,
  replayEventLog,
  summarizeAgentReplay
} from './event-log.ts';

export type {
  AgentReplaySummary,
  AgentReplaySummaryClassifier,
  AgentReplaySummaryClassifierResult,
  AgentReplaySummaryKind,
  AgentReplaySummaryOptions,
  AutonomousDecisionReplayClassifier,
  AutonomousDecisionReplayClassifierResult,
  AutonomousDecisionReplayRecordFields,
  AutonomousDecisionReplayRecordValue,
  AutonomousDecisionReplayOptions,
  AutonomousDecisionReplayStatus,
  AutonomousDecisionReplaySubjectResult,
  AutonomousDecisionReplaySubjectSummary,
  AutonomousDecisionReplaySummary,
  AutonomousDecisionReplayTerminalStatus,
  CoordinatorGateEventFields,
  CoordinatorGateEventKind,
  CoordinatorGateEventStatus,
  CoordinatorGateEventValue,
  EventLog,
  EventLogAppendInput,
  EventLogAppendRejectReason,
  EventLogAppendResult,
  EventLogBatchAppendResult,
  EventLogBatchOptions,
  EventLogCheckpoint,
  EventLogCheckpointOptions,
  EventLogCompactOptions,
  EventLogConsumer,
  EventLogCursor,
  EventLogDiscardPolicy,
  EventLogOptions,
  EventLogReadOptions,
  EventLogReadResult,
  EventLogRecord,
  EventLogReplayOptions,
  EventLogReplayReducer,
  EventLogReplayResult,
  EventLogReplayStorage,
  EventLogReplayStorageOptions,
  EventLogReplayStorageReadOptions,
  EventLogReplayStorageStats,
  EventLogSchedulerLike,
  EventLogSchedulerTask,
  EventLogStats,
  EventLogDiffBetweenTimesOptions,
  PatchEventLogOptions,
  PatchEventLogValue,
  SemanticChangeStreamEventFields,
  SemanticChangeStreamEventFilterOptions,
  SemanticChangeStreamEventKind,
  SemanticChangeStreamEventValue,
  SemanticChangeStreamReplayOptions,
  ModelRoutingFeedbackEventFields,
  ModelRoutingFeedbackEventFilterOptions,
  ModelRoutingFeedbackEventKind,
  ModelRoutingFeedbackEventValue,
  EventLogStateAtTimeOptions,
  EventLogTemporalDiffResult,
  EventLogTemporalPoint,
  EventLogTemporalStateResult,
  ContinuousPoolLifecycleEventFields,
  ContinuousPoolLifecycleEventKind,
  ContinuousPoolLifecycleEventValue,
  BundleSynthesisDecision,
  BundleSynthesisEventFields,
  BundleSynthesisEventKind,
  BundleSynthesisEventValue
} from './event-log.ts';

export type AutonomousDecisionEventStatus = AutonomousDecisionReplayStatus | 'no-change';

export type AutonomousDecisionEventValue = Omit<AutonomousDecisionReplayRecordValue, 'kind'> & {
  kind: AutonomousDecisionEventStatus;
  id?: string;
  eventId?: string;
};

export type AutonomousDecisionEventFields = Omit<AutonomousDecisionEventValue, 'kind'>;

export type AutonomousDecisionEventOptions = Omit<EventLogAppendInput<AutonomousDecisionEventValue>, 'value'>;

export type QuestionLifecycleEventKind =
  | 'question.opened'
  | 'question.answered'
  | 'question.consumed';

export type QuestionLifecycleReplayStatus =
  | 'opened'
  | 'answered'
  | 'consumed';

export interface QuestionLifecycleEventValue extends JsonObject {
  kind: QuestionLifecycleEventKind;
  id?: string;
  eventId?: string;
  questionId?: string;
  questionCode?: string;
  questionIds?: string[];
  questionCodes?: string[];
  jobId?: string;
  jobIds?: string[];
  taskId?: string;
  taskIds?: string[];
  decisionId?: string;
  decisionIds?: string[];
  answerText?: JsonValue;
  continuationTarget?: string;
  unresolvedReason?: string;
  metadata?: JsonObject;
}

export type QuestionLifecycleEventFields = Omit<QuestionLifecycleEventValue, 'kind'>;

export type QuestionLifecycleEventOptions = Omit<EventLogAppendInput<QuestionLifecycleEventValue>, 'value'>;

export type QuestionLifecycleReplayQuestionResult = string | readonly string[] | null | undefined | false;

export type QuestionLifecycleReplayQuestionResolver<TValue extends JsonValue = JsonValue> = (
  record: EventLogRecord<TValue>
) => QuestionLifecycleReplayQuestionResult;

export type QuestionLifecycleReplayClassifierResult =
  | QuestionLifecycleReplayStatus
  | null
  | undefined
  | false;

export type QuestionLifecycleReplayClassifier<TValue extends JsonValue = JsonValue> = (
  record: EventLogRecord<TValue>
) => QuestionLifecycleReplayClassifierResult;

export interface QuestionLifecycleReplayQuestionSummary<TValue extends JsonValue = JsonValue> {
  questionId: string;
  questionIds: string[];
  records: number;
  firstOffset: number;
  lastOffset: number;
  opened: number;
  answered: number;
  consumed: number;
  status: QuestionLifecycleReplayStatus;
  terminalStatus: QuestionLifecycleReplayStatus | null;
  currentRecord: EventLogRecord<TValue>;
  terminalRecord: EventLogRecord<TValue> | null;
}

export interface QuestionLifecycleReplaySummary<TValue extends JsonValue = JsonValue> {
  records: number;
  matchedRecords: number;
  questionCount: number;
  opened: number;
  answered: number;
  consumed: number;
  terminalRecords: number;
  openRecords: number;
  questions: QuestionLifecycleReplayQuestionSummary<TValue>[];
  openedQuestions: QuestionLifecycleReplayQuestionSummary<TValue>[];
  answeredQuestions: QuestionLifecycleReplayQuestionSummary<TValue>[];
  consumedQuestions: QuestionLifecycleReplayQuestionSummary<TValue>[];
  byQuestionId: Record<string, QuestionLifecycleReplayQuestionSummary<TValue>>;
  byAlias: Record<string, QuestionLifecycleReplayQuestionSummary<TValue>>;
  latestAnsweredByQuestionId: Record<string, QuestionLifecycleReplayQuestionSummary<TValue>>;
  latestConsumedByQuestionId: Record<string, QuestionLifecycleReplayQuestionSummary<TValue>>;
  cursor: EventLogCursor;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  truncated: boolean;
}

export interface QuestionLifecycleReplayOptions<TValue extends JsonValue = JsonValue> {
  cursor?: EventLogCursor | number | null;
  batchSize?: number;
  maxBytesPerRead?: number;
  strict?: boolean;
  classify?: QuestionLifecycleReplayClassifier<TValue>;
  resolveQuestionId?: QuestionLifecycleReplayQuestionResolver<TValue>;
}

export type ContinuousPoolWorkerLifecycleEventKind =
  | 'worker.scheduled'
  | 'worker.started'
  | 'worker.heartbeat'
  | 'worker.finished'
  | 'worker.failed'
  | 'worker.drained';

export interface ContinuousPoolWorkerLifecycleEventValue extends JsonObject {
  kind: ContinuousPoolWorkerLifecycleEventKind;
  run?: string;
  worker?: string;
  task?: string;
  lane?: string;
  decision?: string;
  leaseScope?: string;
  leaseScopes?: string[];
}

export type ContinuousPoolWorkerLifecycleEventFields = Omit<ContinuousPoolWorkerLifecycleEventValue, 'kind'>;

export type ContinuousPoolWorkerLifecycleEventOptions = Omit<
  EventLogAppendInput<ContinuousPoolWorkerLifecycleEventValue>,
  'value'
>;

export function appendContinuousPoolWorkerScheduledEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  return appendContinuousPoolWorkerLifecycleEvent(log, 'worker.scheduled', value, options);
}

export function appendContinuousPoolWorkerStartedEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  return appendContinuousPoolWorkerLifecycleEvent(log, 'worker.started', value, options);
}

export function appendContinuousPoolWorkerHeartbeatEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  return appendContinuousPoolWorkerLifecycleEvent(log, 'worker.heartbeat', value, options);
}

export function appendContinuousPoolWorkerFailedEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  return appendContinuousPoolWorkerLifecycleEvent(log, 'worker.failed', value, options);
}

export function appendContinuousPoolWorkerDrainedEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  return appendContinuousPoolWorkerLifecycleEvent(log, 'worker.drained', value, options);
}

export function appendAutonomousDecisionAppliedEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'applied', value, options);
}

export function appendAutonomousDecisionCommittedEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'committed', value, options);
}

export function appendAutonomousDecisionRejectedEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'rejected', value, options);
}

export function appendAutonomousDecisionRerunEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'rerun', value, options);
}

export function appendAutonomousDecisionNoChangeEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'no-change', value, options);
}

export function appendAutonomousDecisionSupersededEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'superseded', value, options);
}

export function appendAutonomousDecisionConflictBlockedEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'conflict-blocked', value, options);
}

export function appendAutonomousDecisionHumanBlockedEvent(
  log: EventLog<AutonomousDecisionEventValue>,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  return appendAutonomousDecisionEventRecord(log, 'human-blocked', value, options);
}

export function appendQuestionAskedEvent(
  log: EventLog<QuestionLifecycleEventValue>,
  value: QuestionLifecycleEventFields,
  options: QuestionLifecycleEventOptions = {}
): EventLogRecord<QuestionLifecycleEventValue> {
  return appendQuestionOpenedEvent(log, value, options);
}

export function appendQuestionOpenedEvent(
  log: EventLog<QuestionLifecycleEventValue>,
  value: QuestionLifecycleEventFields,
  options: QuestionLifecycleEventOptions = {}
): EventLogRecord<QuestionLifecycleEventValue> {
  return appendQuestionLifecycleEvent(log, 'question.opened', value, options);
}

export function appendQuestionAnsweredEvent(
  log: EventLog<QuestionLifecycleEventValue>,
  value: QuestionLifecycleEventFields,
  options: QuestionLifecycleEventOptions = {}
): EventLogRecord<QuestionLifecycleEventValue> {
  return appendQuestionLifecycleEvent(log, 'question.answered', value, options);
}

export function appendQuestionConsumedEvent(
  log: EventLog<QuestionLifecycleEventValue>,
  value: QuestionLifecycleEventFields,
  options: QuestionLifecycleEventOptions = {}
): EventLogRecord<QuestionLifecycleEventValue> {
  return appendQuestionLifecycleEvent(log, 'question.consumed', value, options);
}

export function summarizeQuestionLifecycleReplay<TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  options: QuestionLifecycleReplayOptions<TValue> = {}
): QuestionLifecycleReplaySummary<TValue> {
  if (log === null || typeof log !== 'object' || typeof log.read !== 'function') {
    throw new TypeError('event log question replay summary requires an event log');
  }
  const classify = options.classify === undefined ? classifyQuestionLifecycleRecord : options.classify;
  if (typeof classify !== 'function') {
    throw new TypeError('event log question replay summary classifier must be a function');
  }
  const resolveQuestionId = options.resolveQuestionId === undefined
    ? resolveQuestionLifecycleRecordIds
    : options.resolveQuestionId;
  if (typeof resolveQuestionId !== 'function') {
    throw new TypeError('event log question replay summary question resolver must be a function');
  }

  const batchSize = options.batchSize === undefined ? 256 : Math.max(1, Math.floor(options.batchSize));
  const maxBytes = options.maxBytesPerRead === undefined ? undefined : Math.max(0, Math.floor(options.maxBytesPerRead));
  let cursor = normalizeQuestionLifecycleCursor(options.cursor);
  const componentByAlias = new Map<string, QuestionLifecycleReplayQuestionSummary<TValue>>();
  const components = new Set<QuestionLifecycleReplayQuestionSummary<TValue>>();
  const summary: QuestionLifecycleReplaySummary<TValue> = {
    records: 0,
    matchedRecords: 0,
    questionCount: 0,
    opened: 0,
    answered: 0,
    consumed: 0,
    terminalRecords: 0,
    openRecords: 0,
    questions: [],
    openedQuestions: [],
    answeredQuestions: [],
    consumedQuestions: [],
    byQuestionId: Object.create(null),
    byAlias: Object.create(null),
    latestAnsweredByQuestionId: Object.create(null),
    latestConsumedByQuestionId: Object.create(null),
    cursor: { offset: cursor },
    firstOffset: log.firstOffset,
    nextOffset: log.nextOffset,
    highWatermark: log.highWatermark,
    truncated: false
  };

  for (;;) {
    const readOptions: {
      limit: number;
      maxBytes?: number;
    } = { limit: batchSize };
    if (maxBytes !== undefined) readOptions.maxBytes = maxBytes;
    const result = log.read(cursor, readOptions);
    summary.firstOffset = result.firstOffset;
    summary.nextOffset = result.nextOffset;
    summary.highWatermark = result.highWatermark;
    summary.cursor = result.cursor;
    if (result.truncated) {
      summary.truncated = true;
      if (options.strict === true) {
        throw new RangeError('event log question replay summary was truncated before offset ' + cursor);
      }
    }

    for (let i = 0; i < result.records.length; i++) {
      summary.records++;
      const record = result.records[i];
      const status = classify(record);
      if (status === null || status === undefined || status === false) continue;
      const questionIds = normalizeQuestionLifecycleQuestionIds(resolveQuestionId(record));
      if (questionIds.length === 0) continue;
      summary.matchedRecords++;
      summary[status]++;
      const component = upsertQuestionLifecycleReplayComponent(
        components,
        componentByAlias,
        questionIds,
        record,
        status
      );
      if (status === 'consumed') summary.terminalRecords++;
      else summary.openRecords++;
    }

    cursor = result.cursor.offset;
    if (result.records.length === 0 || cursor >= result.nextOffset) break;
  }

  const questions = Array.from(components)
    .map((component) => materializeQuestionLifecycleReplayQuestion(component))
    .sort((left, right) => {
      if (right.lastOffset !== left.lastOffset) return right.lastOffset - left.lastOffset;
      return left.questionId.localeCompare(right.questionId);
    });

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    summary.byQuestionId[question.questionId] = question;
    for (let j = 0; j < question.questionIds.length; j++) {
      summary.byAlias[question.questionIds[j]] = question;
    }
    if (question.status === 'answered') {
      summary.latestAnsweredByQuestionId[question.questionId] = question;
    } else if (question.status === 'consumed') {
      summary.latestConsumedByQuestionId[question.questionId] = question;
    }
  }

  summary.questions = questions;
  summary.questionCount = questions.length;
  summary.openedQuestions = questions.filter((question) => question.status === 'opened');
  summary.answeredQuestions = questions.filter((question) => question.status === 'answered');
  summary.consumedQuestions = questions.filter((question) => question.status === 'consumed');
  return summary;
}

function appendAutonomousDecisionEventRecord(
  log: EventLog<AutonomousDecisionEventValue>,
  kind: AutonomousDecisionEventStatus,
  value: AutonomousDecisionEventFields,
  options: AutonomousDecisionEventOptions = {}
): EventLogRecord<AutonomousDecisionEventValue> {
  const payload = cloneAutonomousDecisionEventValue(kind, value);
  const id = resolveAutonomousDecisionEventId(kind, payload, options.key);
  payload.id = id;
  if (payload.eventId === undefined) payload.eventId = id;
  return log.append({
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload
  });
}

function appendQuestionLifecycleEvent(
  log: EventLog<QuestionLifecycleEventValue>,
  kind: QuestionLifecycleEventKind,
  value: QuestionLifecycleEventFields,
  options: QuestionLifecycleEventOptions = {}
): EventLogRecord<QuestionLifecycleEventValue> {
  const payload = cloneQuestionLifecycleEventValue(kind, value);
  const id = resolveQuestionLifecycleEventId(payload, options.key);
  if (payload.id === undefined) payload.id = id;
  if (payload.eventId === undefined) payload.eventId = id;
  if (payload.questionId === undefined) payload.questionId = id;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload
  });
}

function appendContinuousPoolWorkerLifecycleEvent(
  log: EventLog<ContinuousPoolWorkerLifecycleEventValue>,
  kind: ContinuousPoolWorkerLifecycleEventKind,
  value: ContinuousPoolWorkerLifecycleEventFields,
  options: ContinuousPoolWorkerLifecycleEventOptions = {}
): EventLogRecord<ContinuousPoolWorkerLifecycleEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log continuous pool worker lifecycle event value must be an object');
  }
  const event = payload as ContinuousPoolWorkerLifecycleEventValue;
  event.kind = kind;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: event
  });
}

function cloneQuestionLifecycleEventValue(
  kind: QuestionLifecycleEventKind,
  value: QuestionLifecycleEventFields
): QuestionLifecycleEventValue {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log question lifecycle event value must be an object');
  }
  const event = payload as QuestionLifecycleEventValue;
  event.kind = kind;
  return event;
}

function resolveQuestionLifecycleEventId(
  value: QuestionLifecycleEventFields,
  key?: string
): string {
  if (typeof key === 'string' && key.trim().length > 0) return key.trim();
  if (typeof value.questionId === 'string' && value.questionId.trim().length > 0) return value.questionId.trim();
  if (typeof value.questionCode === 'string' && value.questionCode.trim().length > 0) return value.questionCode.trim();
  if (typeof value.id === 'string' && value.id.trim().length > 0) return value.id.trim();
  if (typeof value.eventId === 'string' && value.eventId.trim().length > 0) return value.eventId.trim();
  if (typeof value.decisionId === 'string' && value.decisionId.trim().length > 0) return value.decisionId.trim();
  if (typeof value.taskId === 'string' && value.taskId.trim().length > 0) return value.taskId.trim();
  if (typeof value.jobId === 'string' && value.jobId.trim().length > 0) return value.jobId.trim();
  return 'question:' + stableQuestionLifecycleEventIdentity(value);
}

function stableQuestionLifecycleEventIdentity(value: QuestionLifecycleEventFields): string {
  const identity = canonicalQuestionLifecycleEventIdentity(value);
  return stableJsonStringify(identity);
}

function canonicalQuestionLifecycleEventIdentity(value: QuestionLifecycleEventFields): Record<string, unknown> {
  return {
    questionId: normalizeAutonomousDecisionString(value.questionId),
    questionCode: normalizeAutonomousDecisionString(value.questionCode),
    questionIds: normalizeAutonomousDecisionStringArray(value.questionIds as readonly unknown[] | undefined),
    questionCodes: normalizeAutonomousDecisionStringArray(value.questionCodes as readonly unknown[] | undefined),
    id: normalizeAutonomousDecisionString(value.id),
    eventId: normalizeAutonomousDecisionString(value.eventId),
    decisionId: normalizeAutonomousDecisionString(value.decisionId),
    decisionIds: normalizeAutonomousDecisionStringArray(value.decisionIds as readonly unknown[] | undefined),
    taskId: normalizeAutonomousDecisionString(value.taskId),
    taskIds: normalizeAutonomousDecisionStringArray(value.taskIds as readonly unknown[] | undefined),
    jobId: normalizeAutonomousDecisionString(value.jobId),
    jobIds: normalizeAutonomousDecisionStringArray(value.jobIds as readonly unknown[] | undefined)
  };
}

function normalizeQuestionLifecycleCursor(cursor: EventLogCursor | number | null | undefined): number {
  if (cursor === undefined || cursor === null) return 0;
  if (typeof cursor === 'number') {
    if (!Number.isFinite(cursor)) throw new TypeError('event log question replay cursor must be finite');
    return Math.max(0, Math.floor(cursor));
  }
  const offset = Number(cursor.offset);
  if (!Number.isFinite(offset)) throw new TypeError('event log question replay cursor must have a finite offset');
  return Math.max(0, Math.floor(offset));
}

function classifyQuestionLifecycleRecord<TValue extends JsonValue = JsonValue>(
  record: EventLogRecord<TValue>
): QuestionLifecycleReplayClassifierResult {
  const matches = new Set<QuestionLifecycleReplayStatus>();
  const value = record.value;
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const event = value as Record<string, unknown>;
    const fields = [
      'type',
      'kind',
      'event',
      'status',
      'phase',
      'state',
      'outcome',
      'decision',
      'result',
      'reason',
      'lifecycle',
      'transition'
    ];
    for (let i = 0; i < fields.length; i++) {
      const fieldValue = event[fields[i]];
      if (typeof fieldValue === 'string') collectQuestionLifecycleSummaryText(fieldValue, matches);
    }
  }
  if (matches.has('consumed')) return 'consumed';
  if (matches.has('answered')) return 'answered';
  if (matches.has('opened')) return 'opened';
  return null;
}

function collectQuestionLifecycleSummaryText(
  text: string,
  matches: Set<QuestionLifecycleReplayStatus>
): void {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
  for (let i = 0; i < tokens.length; i++) {
    const status = matchQuestionLifecycleSummaryToken(tokens[i]);
    if (status !== null) matches.add(status);
  }
}

function matchQuestionLifecycleSummaryToken(token: string): QuestionLifecycleReplayStatus | null {
  switch (token) {
    case 'open':
    case 'opened':
    case 'ask':
    case 'asked':
    case 'question':
    case 'questions':
      return 'opened';
    case 'answer':
    case 'answered':
    case 'reply':
    case 'replied':
    case 'respond':
    case 'responded':
      return 'answered';
    case 'consume':
    case 'consumed':
    case 'route':
    case 'routed':
    case 'continue':
    case 'continued':
      return 'consumed';
    default:
      return null;
  }
}

function resolveQuestionLifecycleRecordIds<TValue extends JsonValue = JsonValue>(
  record: EventLogRecord<TValue>
): QuestionLifecycleReplayQuestionResult {
  const aliases = normalizeQuestionLifecycleQuestionIds(record.key);
  const value = record.value;
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return aliases.length === 0 ? null : aliases;
  }
  const event = value as Record<string, unknown>;
  appendQuestionLifecycleQuestionIds(aliases, event.questionId);
  appendQuestionLifecycleQuestionIds(aliases, event.questionCode);
  appendQuestionLifecycleQuestionIds(aliases, event.questionIds);
  appendQuestionLifecycleQuestionIds(aliases, event.questionCodes);
  appendQuestionLifecycleQuestionIds(aliases, event.id);
  appendQuestionLifecycleQuestionIds(aliases, event.eventId);
  appendQuestionLifecycleQuestionIds(aliases, event.decisionId);
  appendQuestionLifecycleQuestionIds(aliases, event.decisionIds);
  appendQuestionLifecycleQuestionIds(aliases, event.taskId);
  appendQuestionLifecycleQuestionIds(aliases, event.taskIds);
  appendQuestionLifecycleQuestionIds(aliases, event.jobId);
  appendQuestionLifecycleQuestionIds(aliases, event.jobIds);
  return aliases.length === 0 ? null : aliases;
}

function appendQuestionLifecycleQuestionIds(
  target: string[],
  value: unknown
): void {
  if (Array.isArray(value)) {
    const normalized = normalizeAutonomousDecisionStringArray(value);
    if (normalized !== undefined) {
      for (let i = 0; i < normalized.length; i++) {
        if (!target.includes(normalized[i])) target.push(normalized[i]);
      }
    }
    return;
  }
  const normalized = normalizeAutonomousDecisionString(value);
  if (normalized !== undefined && !target.includes(normalized)) target.push(normalized);
}

function normalizeQuestionLifecycleQuestionIds(
  value: QuestionLifecycleReplayQuestionResult
): string[] {
  if (value === null || value === undefined || value === false) return [];
  const values = Array.isArray(value) ? value : [value];
  const ids: string[] = [];
  for (let i = 0; i < values.length; i++) appendQuestionLifecycleQuestionIds(ids, values[i]);
  return ids;
}

function upsertQuestionLifecycleReplayComponent<TValue extends JsonValue>(
  components: Set<QuestionLifecycleReplayQuestionSummary<TValue>>,
  componentByAlias: Map<string, QuestionLifecycleReplayQuestionSummary<TValue>>,
  questionIds: string[],
  record: EventLogRecord<TValue>,
  status: QuestionLifecycleReplayStatus
): QuestionLifecycleReplayQuestionSummary<TValue> {
  const matches: QuestionLifecycleReplayQuestionSummary<TValue>[] = [];
  for (let i = 0; i < questionIds.length; i++) {
    const component = componentByAlias.get(questionIds[i]);
    if (component !== undefined && !matches.includes(component)) matches.push(component);
  }

  let component = matches[0];
  if (component === undefined) {
    component = createQuestionLifecycleReplayComponent(record, questionIds, status);
    components.add(component);
  } else if (matches.length > 1) {
    for (let i = 1; i < matches.length; i++) {
      mergeQuestionLifecycleReplayComponents(component, matches[i], componentByAlias, components);
    }
  }

  for (let i = 0; i < questionIds.length; i++) {
    const questionId = questionIds[i];
    if (!component.questionIds.includes(questionId)) component.questionIds.push(questionId);
    componentByAlias.set(questionId, component);
  }

  component.records++;
  if (record.offset < component.firstOffset) component.firstOffset = record.offset;
  if (record.offset > component.lastOffset) component.lastOffset = record.offset;
  if (compareEventLogRecords(record, component.currentRecord) >= 0) {
    component.currentRecord = record;
    component.status = status;
  }
  if (status === 'consumed' && (component.terminalRecord === null || compareEventLogRecords(record, component.terminalRecord) >= 0)) {
    component.terminalStatus = 'consumed';
    component.terminalRecord = record;
  }
  if (status === 'opened') component.opened++;
  else if (status === 'answered') component.answered++;
  else component.consumed++;
  return component;
}

function createQuestionLifecycleReplayComponent<TValue extends JsonValue>(
  record: EventLogRecord<TValue>,
  questionIds: string[],
  status: QuestionLifecycleReplayStatus
): QuestionLifecycleReplayQuestionSummary<TValue> {
  const questionId = questionIds[0];
  return {
    questionId,
    questionIds: questionIds.slice(),
    records: 1,
    firstOffset: record.offset,
    lastOffset: record.offset,
    opened: status === 'opened' ? 1 : 0,
    answered: status === 'answered' ? 1 : 0,
    consumed: status === 'consumed' ? 1 : 0,
    status,
    terminalStatus: status === 'consumed' ? 'consumed' : null,
    currentRecord: record,
    terminalRecord: status === 'consumed' ? record : null
  };
}

function mergeQuestionLifecycleReplayComponents<TValue extends JsonValue>(
  target: QuestionLifecycleReplayQuestionSummary<TValue>,
  source: QuestionLifecycleReplayQuestionSummary<TValue>,
  componentByAlias: Map<string, QuestionLifecycleReplayQuestionSummary<TValue>>,
  components: Set<QuestionLifecycleReplayQuestionSummary<TValue>>
): void {
  if (source === target) return;
  target.records += source.records;
  target.opened += source.opened;
  target.answered += source.answered;
  target.consumed += source.consumed;
  if (source.firstOffset < target.firstOffset) target.firstOffset = source.firstOffset;
  if (source.lastOffset > target.lastOffset) target.lastOffset = source.lastOffset;

  for (let i = 0; i < source.questionIds.length; i++) {
    const alias = source.questionIds[i];
    if (!target.questionIds.includes(alias)) target.questionIds.push(alias);
    componentByAlias.set(alias, target);
  }

  if (compareEventLogRecords(source.currentRecord, target.currentRecord) >= 0) {
    target.currentRecord = source.currentRecord;
    target.status = source.status;
  }
  if (
    source.terminalRecord !== null
    && (target.terminalRecord === null || compareEventLogRecords(source.terminalRecord, target.terminalRecord) >= 0)
  ) {
    target.terminalRecord = source.terminalRecord;
    target.terminalStatus = source.terminalStatus;
  }
  components.delete(source);
}

function materializeQuestionLifecycleReplayQuestion<TValue extends JsonValue>(
  component: QuestionLifecycleReplayQuestionSummary<TValue>
): QuestionLifecycleReplayQuestionSummary<TValue> {
  const questionIds = component.questionIds.slice().sort((left, right) => left.localeCompare(right));
  return {
    questionId: component.questionId,
    questionIds,
    records: component.records,
    firstOffset: component.firstOffset,
    lastOffset: component.lastOffset,
    opened: component.opened,
    answered: component.answered,
    consumed: component.consumed,
    status: component.status,
    terminalStatus: component.terminalStatus,
    currentRecord: component.currentRecord,
    terminalRecord: component.terminalRecord
  };
}

function compareEventLogRecords<TValue extends JsonValue>(
  left: EventLogRecord<TValue>,
  right: EventLogRecord<TValue>
): number {
  if (left.offset !== right.offset) return left.offset - right.offset;
  if (left.timestamp !== right.timestamp) return left.timestamp - right.timestamp;
  if (left.key === right.key) return 0;
  if (left.key === undefined) return -1;
  if (right.key === undefined) return 1;
  return left.key.localeCompare(right.key);
}

function cloneAutonomousDecisionEventValue(
  kind: AutonomousDecisionEventStatus,
  value: AutonomousDecisionEventFields
): AutonomousDecisionEventValue {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('event log autonomous decision event value must be an object');
  }
  return {
    ...value,
    kind
  };
}

function resolveAutonomousDecisionEventId(
  kind: AutonomousDecisionEventStatus,
  value: AutonomousDecisionEventFields,
  key?: string
): string {
  if (typeof key === 'string' && key.trim().length > 0) return key.trim();
  if (typeof value.id === 'string' && value.id.trim().length > 0) return value.id.trim();
  if (typeof value.eventId === 'string' && value.eventId.trim().length > 0) return value.eventId.trim();
  return 'autonomous-decision:' + stableAutonomousDecisionEventIdentity(kind, value);
}

function stableAutonomousDecisionEventIdentity(
  kind: AutonomousDecisionEventStatus,
  value: AutonomousDecisionReplayRecordFields
): string {
  const identity = canonicalAutonomousDecisionEventIdentity(kind, value);
  return stableJsonStringify(identity);
}

function canonicalAutonomousDecisionEventIdentity(
  kind: AutonomousDecisionEventStatus,
  value: AutonomousDecisionReplayRecordFields
): Record<string, unknown> {
  return {
    kind,
    queueSubject: normalizeAutonomousDecisionString(value.queueSubject),
    queueSubjectAliases: normalizeAutonomousDecisionStringArray(value.queueSubjectAliases),
    queueSubjects: normalizeAutonomousDecisionStringArray(value.queueSubjects),
    queueKeys: normalizeAutonomousDecisionStringArray(value.queueKeys),
    queueItemIds: normalizeAutonomousDecisionStringArray(value.queueItemIds),
    jobId: normalizeAutonomousDecisionString(value.jobId),
    taskId: normalizeAutonomousDecisionString(value.taskId),
    taskIds: normalizeAutonomousDecisionStringArray(value.taskIds),
    run: normalizeAutonomousDecisionString(value.run),
    sourceRun: normalizeAutonomousDecisionString(value.sourceRun),
    lane: normalizeAutonomousDecisionString(value.lane),
    changedPaths: normalizeAutonomousDecisionStringArray(value.changedPaths),
    decisionReason: normalizeAutonomousDecisionString(value.decisionReason),
    verificationSummary: value.verificationSummary
  };
}

function normalizeAutonomousDecisionString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeAutonomousDecisionStringArray(values: readonly unknown[] | undefined): string[] | undefined {
  if (!Array.isArray(values)) return undefined;
  const normalized: string[] = [];
  for (let i = 0; i < values.length; i++) {
    const candidate = normalizeAutonomousDecisionString(values[i]);
    if (candidate === undefined || normalized.includes(candidate)) continue;
    normalized.push(candidate);
  }
  if (normalized.length === 0) return undefined;
  normalized.sort((left, right) => left.localeCompare(right));
  return normalized;
}

function stableJsonStringify(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'bigint') return JSON.stringify(value.toString());
  if (typeof value === 'undefined') return 'null';
  if (Array.isArray(value)) {
    return '[' + value.map((item) => stableJsonStringify(item)).join(',') + ']';
  }
  if (typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>).sort().map((key) => {
      const candidate = (value as Record<string, unknown>)[key];
      return JSON.stringify(key) + ':' + stableJsonStringify(candidate);
    });
    return '{' + entries.join(',') + '}';
  }
  return JSON.stringify(String(value));
}
