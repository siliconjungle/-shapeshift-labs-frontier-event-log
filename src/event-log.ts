import { applyPatch } from '@shapeshift-labs/frontier/apply';
import { cloneJson } from '@shapeshift-labs/frontier/clone';
import { diff as diffJson } from '@shapeshift-labs/frontier/diff';
import type {
  JsonObject,
  JsonValue,
  Patch
} from '@shapeshift-labs/frontier/types';

export type EventLogDiscardPolicy = 'oldest' | 'new';
export type EventLogAppendRejectReason = 'capacity' | 'batch-limit';

export interface EventLogCursor {
  offset: number;
}

export interface EventLogRecord<T extends JsonValue = JsonValue> {
  offset: number;
  timestamp: number;
  key?: string;
  value: T;
  headers?: JsonObject;
}

export interface EventLogAppendInput<T extends JsonValue = JsonValue> {
  value: T;
  key?: string;
  timestamp?: number;
  headers?: JsonObject;
}

export interface EventLogOptions {
  capacity?: number;
  discard?: EventLogDiscardPolicy;
  compactByKey?: boolean;
  compactOnAppend?: boolean;
  dropTombstones?: boolean;
  scheduler?: EventLogSchedulerLike;
  schedulerLane?: string;
  schedulerPriority?: unknown;
  schedulerAutoRun?: boolean;
  schedulerRunOptions?: unknown;
  initialOffset?: number;
  now?: () => number;
}

export interface EventLogSchedulerTask {
  id?: string;
  type?: string;
  lane?: string;
  area?: string;
  priority?: unknown;
  units?: number;
  key?: string;
  metadata?: Record<string, unknown>;
  run(context?: unknown): unknown;
}

export interface EventLogSchedulerLike {
  schedule(task: EventLogSchedulerTask): unknown;
  run?(options?: unknown): unknown;
  requestRun?(options?: unknown): unknown;
}

export interface EventLogAppendResult<T extends JsonValue = JsonValue> {
  accepted: boolean;
  record?: EventLogRecord<T>;
  reason?: EventLogAppendRejectReason;
}

type EventLogStoredAppendResult<T extends JsonValue = JsonValue> =
  | { accepted: true; record: EventLogRecord<T> }
  | { accepted: false; reason: EventLogAppendRejectReason };

export interface EventLogBatchOptions {
  maxRecords?: number;
  maxBytes?: number;
}

export interface EventLogBatchAppendResult<T extends JsonValue = JsonValue> {
  records: EventLogRecord<T>[];
  rejected: number;
  nextOffset: number;
  highWatermark: number;
}

export interface EventLogReadOptions {
  limit?: number;
  maxBytes?: number;
}

export interface EventLogReadResult<T extends JsonValue = JsonValue> {
  records: EventLogRecord<T>[];
  cursor: EventLogCursor;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  truncated: boolean;
  lag: number;
}

export interface EventLogCheckpoint<TSnapshot = JsonValue> {
  cursor: EventLogCursor;
  snapshot: TSnapshot;
  timestamp: number;
  highWatermark: number;
  metadata?: JsonObject;
}

export interface EventLogStats {
  records: number;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  appended: number;
  dropped: number;
  compacted: number;
  consumers: number;
}

export interface EventLogConsumer<T extends JsonValue = JsonValue> {
  readonly id: string;
  readonly cursor: EventLogCursor;
  readonly committed: EventLogCursor;
  read(options?: EventLogReadOptions): EventLogReadResult<T>;
  ack(cursor?: EventLogCursor | number): EventLogCursor;
  seek(cursor: EventLogCursor | number): EventLogCursor;
  lag(): number;
}

export interface EventLog<T extends JsonValue = JsonValue> {
  readonly firstOffset: number;
  readonly nextOffset: number;
  readonly highWatermark: number;
  append(input: EventLogAppendInput<T>): EventLogRecord<T>;
  tryAppend(input: EventLogAppendInput<T>): EventLogAppendResult<T>;
  appendBatch(inputs: readonly EventLogAppendInput<T>[], options?: EventLogBatchOptions): EventLogBatchAppendResult<T>;
  read(cursor?: EventLogCursor | number | null, options?: EventLogReadOptions): EventLogReadResult<T>;
  createConsumer(id: string, cursor?: EventLogCursor | number | null): EventLogConsumer<T>;
  compact(options?: EventLogCompactOptions): number;
  truncateBefore(cursor: EventLogCursor | number): number;
  clear(): void;
  getStats(): EventLogStats;
}

export interface EventLogCompactOptions {
  dropTombstones?: boolean;
}

export interface EventLogCheckpointOptions {
  cursor?: EventLogCursor | number;
  timestamp?: number;
  metadata?: JsonObject;
}

export type EventLogReplayReducer<TState, TValue extends JsonValue = JsonValue> = (
  state: TState,
  record: EventLogRecord<TValue>
) => TState;

export interface EventLogReplayOptions {
  batchSize?: number;
  maxBytesPerRead?: number;
  strict?: boolean;
}

export interface EventLogReplayResult<TState> {
  state: TState;
  cursor: EventLogCursor;
  checkpoint: EventLogCheckpoint<TState>;
  replayed: number;
  truncated: boolean;
  highWatermark: number;
}

export type AgentReplaySummaryKind =
  | 'started'
  | 'finished'
  | 'failed'
  | 'question'
  | 'decision'
  | 'applied';

export type AgentReplaySummaryClassifierResult =
  | AgentReplaySummaryKind
  | readonly AgentReplaySummaryKind[]
  | null
  | undefined
  | false;

export type AgentReplaySummaryClassifier<TValue extends JsonValue = JsonValue> = (
  record: EventLogRecord<TValue>
) => AgentReplaySummaryClassifierResult;

export interface AgentReplaySummaryOptions<TValue extends JsonValue = JsonValue> {
  cursor?: EventLogCursor | number | null;
  batchSize?: number;
  maxBytesPerRead?: number;
  strict?: boolean;
  classify?: AgentReplaySummaryClassifier<TValue>;
}

export interface AgentReplaySummary {
  started: number;
  finished: number;
  failed: number;
  question: number;
  decision: number;
  applied: number;
  records: number;
  matchedRecords: number;
  cursor: EventLogCursor;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  truncated: boolean;
}

export type AutonomousDecisionReplayStatus =
  | 'applied'
  | 'committed'
  | 'rejected'
  | 'rerun'
  | 'superseded'
  | 'conflict-blocked'
  | 'human-blocked';

export type AutonomousDecisionReplayTerminalStatus = Extract<
  AutonomousDecisionReplayStatus,
  'applied' | 'committed' | 'rejected' | 'superseded'
>;

export type AutonomousDecisionReplayClassifierResult =
  | AutonomousDecisionReplayStatus
  | null
  | undefined
  | false;

export type AutonomousDecisionReplayClassifier<TValue extends JsonValue = JsonValue> = (
  record: EventLogRecord<TValue>
) => AutonomousDecisionReplayClassifierResult;

export type AutonomousDecisionReplaySubjectResult = string | readonly string[] | null | undefined | false;

export type AutonomousDecisionReplaySubjectResolver<TValue extends JsonValue = JsonValue> = (
  record: EventLogRecord<TValue>
) => AutonomousDecisionReplaySubjectResult;

export interface AutonomousDecisionReplayRecordValue extends JsonObject {
  kind: AutonomousDecisionReplayStatus;
  queueSubject?: string;
  queueSubjectAliases?: string[];
  queueSubjects?: string[];
  queueKey?: string;
  queueKeys?: string[];
  queueItemId?: string;
  queueItemIds?: string[];
  jobId?: string;
  taskId?: string;
  taskIds?: string[];
  run?: string;
  sourceRun?: string;
  lane?: string;
  changedPaths?: string[];
  verificationSummary?: JsonValue;
  decisionReason?: string;
}

export type AutonomousDecisionReplayRecordFields = Omit<
  AutonomousDecisionReplayRecordValue,
  'kind' | 'queueSubjectAliases' | 'queueSubjects' | 'queueKeys' | 'queueItemIds' | 'taskIds' | 'changedPaths'
> & {
  queueSubjectAliases?: readonly string[];
  queueSubjects?: readonly string[];
  queueKeys?: readonly string[];
  queueItemIds?: readonly string[];
  taskIds?: readonly string[];
  changedPaths?: readonly string[];
};

export interface AutonomousDecisionReplayOptions<TValue extends JsonValue = JsonValue> {
  cursor?: EventLogCursor | number | null;
  batchSize?: number;
  maxBytesPerRead?: number;
  strict?: boolean;
  classify?: AutonomousDecisionReplayClassifier<TValue>;
  resolveQueueSubject?: AutonomousDecisionReplaySubjectResolver<TValue>;
}

export interface AutonomousDecisionReplaySubjectSummary<TValue extends JsonValue = JsonValue> {
  queueSubject: string;
  queueSubjectAliases: string[];
  records: number;
  firstOffset: number;
  lastOffset: number;
  applied: number;
  committed: number;
  rejected: number;
  rerun: number;
  superseded: number;
  conflictBlocked: number;
  humanBlocked: number;
  status: AutonomousDecisionReplayStatus;
  terminalStatus: AutonomousDecisionReplayTerminalStatus | null;
  currentRecord: EventLogRecord<TValue>;
  terminalRecord: EventLogRecord<TValue> | null;
}

export interface AutonomousDecisionReplaySummary<TValue extends JsonValue = JsonValue> {
  records: number;
  matchedRecords: number;
  applied: number;
  committed: number;
  rejected: number;
  rerun: number;
  superseded: number;
  conflictBlocked: number;
  humanBlocked: number;
  terminalRecords: number;
  openRecords: number;
  subjects: AutonomousDecisionReplaySubjectSummary<TValue>[];
  byQueueSubject: Record<string, AutonomousDecisionReplaySubjectSummary<TValue>>;
  byAlias: Record<string, AutonomousDecisionReplaySubjectSummary<TValue>>;
  latestTerminalByQueueSubject: Record<string, AutonomousDecisionReplaySubjectSummary<TValue>>;
  latestOpenByQueueSubject: Record<string, AutonomousDecisionReplaySubjectSummary<TValue>>;
  cursor: EventLogCursor;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  truncated: boolean;
}

export type CoordinatorGateEventStatus =
  | 'selected'
  | 'started'
  | 'passed'
  | 'failed'
  | 'skipped';

export type CoordinatorGateEventKind =
  | 'gate.selected'
  | 'gate.started'
  | 'gate.passed'
  | 'gate.failed'
  | 'gate.skipped';

export interface CoordinatorGateEventValue extends JsonObject {
  kind: CoordinatorGateEventKind;
  status: CoordinatorGateEventStatus;
  gateName: string;
  jobId?: string;
  jobIds?: string[];
  taskId?: string;
  taskIds?: string[];
  queueSubject?: string;
  queueSubjectAliases?: string[];
  queueSubjects?: string[];
  queueKey?: string;
  queueKeys?: string[];
  queueItemId?: string;
  queueItemIds?: string[];
  run?: string;
  lane?: string;
  reason?: string;
}

export type CoordinatorGateEventFields = Omit<
  CoordinatorGateEventValue,
  'kind' | 'status' | 'jobIds' | 'taskIds' | 'queueSubjectAliases' | 'queueSubjects' | 'queueKeys' | 'queueItemIds'
> & {
  jobIds?: readonly string[];
  taskIds?: readonly string[];
  queueSubjectAliases?: readonly string[];
  queueSubjects?: readonly string[];
  queueKeys?: readonly string[];
  queueItemIds?: readonly string[];
};

export type EventLogTemporalPoint =
  | number
  | EventLogCursor
  | {
      offset?: number;
      cursor?: EventLogCursor | number;
      highWatermark?: number;
      timestamp?: number;
      inclusive?: boolean;
    };

export interface EventLogStateAtTimeOptions extends EventLogReplayOptions {
  at?: EventLogTemporalPoint;
}

export interface EventLogTemporalStateResult<TState> {
  state: TState;
  cursor: EventLogCursor;
  checkpoint: EventLogCheckpoint<TState>;
  replayed: number;
  truncated: boolean;
  highWatermark: number;
}

export interface EventLogDiffBetweenTimesOptions<TState extends JsonValue> extends EventLogReplayOptions {
  from: EventLogTemporalPoint;
  to: EventLogTemporalPoint;
  diff?: (before: TState, after: TState) => Patch;
}

export interface EventLogTemporalDiffResult<TState extends JsonValue> {
  before: TState;
  after: TState;
  patch: Patch;
  from: EventLogTemporalStateResult<TState>;
  to: EventLogTemporalStateResult<TState>;
  replayed: number;
  truncated: boolean;
  highWatermark: number;
}

export interface EventLogReplayStorageReadOptions {
  sinceSeq?: number;
  limit?: number;
  cursor?: EventLogCursor | number | null;
  maxBytes?: number;
}

export interface EventLogReplayStorageStats {
  checkpointed: boolean;
  checkpointOffset: number;
  log: EventLogStats;
}

export interface EventLogReplayStorageOptions<TSnapshot = JsonValue> {
  log?: EventLog<JsonValue>;
  initialSnapshot?: TSnapshot | null;
  initialCheckpoint?: EventLogCheckpoint<TSnapshot | null> | null;
  capacity?: number;
  now?: () => number;
}

export interface EventLogReplayStorage<TSnapshot = JsonValue, TEntry = JsonValue> {
  readonly log: EventLog<JsonValue>;
  load(): TSnapshot | null;
  save(snapshot: TSnapshot): void;
  appendChange(entry: TEntry): EventLogRecord<JsonValue>;
  readChangeLog(options?: EventLogReplayStorageReadOptions): TEntry[];
  compact(snapshot?: TSnapshot): EventLogCheckpoint<TSnapshot | null>;
  clear(): void;
  getCheckpoint(): EventLogCheckpoint<TSnapshot | null> | null;
  getStats(): EventLogReplayStorageStats;
}

export interface PatchEventLogValue extends JsonObject {
  kind: 'patch';
  patch: Patch;
  metadata?: JsonObject;
}

export interface PatchEventLogOptions {
  key?: string;
  timestamp?: number;
  headers?: JsonObject;
  metadata?: JsonObject;
}

export function createEventLog<T extends JsonValue = JsonValue>(options: EventLogOptions = {}): EventLog<T> {
  const now = typeof options.now === 'function' ? options.now : Date.now;
  const capacity = options.capacity === undefined ? Number.POSITIVE_INFINITY : Math.max(1, Math.floor(options.capacity));
  const discard = options.discard || 'oldest';
  const compactByKey = options.compactByKey === true;
  const compactOnAppend = options.compactOnAppend === true;
  const dropTombstones = options.dropTombstones === true;
  const scheduler = options.scheduler;
  const schedulerLane = options.schedulerLane ?? 'event-log';
  const schedulerPriority = options.schedulerPriority ?? 'low';
  const schedulerAutoRun = options.schedulerAutoRun ?? false;
  const records: EventLogRecord<T>[] = [];
  const consumers = new Map<string, EventLogConsumerImpl<T>>();
  let nextOffset = Math.max(0, Math.floor(options.initialOffset || 0));
  let appended = 0;
  let dropped = 0;
  let compacted = 0;
  let appendBatchDepth = 0;
  let compactAfterBatch = false;
  let compactionScheduled = false;
  let compactionTaskSeq = 0;

  function append(input: EventLogAppendInput<T>): EventLogRecord<T> {
    const result = tryAppend(input);
    if (!result.accepted || result.record === undefined) {
      throw new RangeError('event log append rejected: ' + (result.reason || 'unknown'));
    }
    return result.record;
  }

  function tryAppend(input: EventLogAppendInput<T>): EventLogAppendResult<T> {
    const result = appendStored(input, true);
    if (!result.accepted) return result;
    return { accepted: true, record: cloneRecord(result.record) };
  }

  function appendStored(input: EventLogAppendInput<T>, scheduleCompaction: boolean): EventLogStoredAppendResult<T> {
    if (input === null || typeof input !== 'object') {
      throw new TypeError('event log append input must be an object');
    }
    if (records.length >= capacity && discard === 'new') return { accepted: false, reason: 'capacity' };

    const record: EventLogRecord<T> = {
      offset: nextOffset++,
      timestamp: input.timestamp === undefined ? now() : Number(input.timestamp),
      value: cloneJson(input.value)
    };
    if (input.key !== undefined) record.key = String(input.key);
    if (input.headers !== undefined) record.headers = cloneJson(input.headers);
    records[records.length] = record;
    appended++;

    if (scheduleCompaction && compactByKey && compactOnAppend) queueAppendCompaction();
    enforceCapacity();
    return { accepted: true, record };
  }

  function appendBatch(inputs: readonly EventLogAppendInput<T>[], batchOptions: EventLogBatchOptions = {}): EventLogBatchAppendResult<T> {
    if (!Array.isArray(inputs)) throw new TypeError('event log appendBatch inputs must be an array');
    const maxRecords = batchOptions.maxRecords === undefined
      ? inputs.length
      : Math.max(0, Math.floor(batchOptions.maxRecords));
    const maxBytes = batchOptions.maxBytes === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(0, Math.floor(batchOptions.maxBytes));
    const acceptedCapacity = Number.isFinite(maxRecords) ? Math.min(maxRecords, inputs.length) : inputs.length;
    const accepted = new Array<EventLogRecord<T>>(acceptedCapacity);
    const deferBatchCompaction = compactByKey && compactOnAppend && capacity === Number.POSITIVE_INFINITY;
    let acceptedCount = 0;
    let bytes = 0;
    let rejected = 0;
    let batchCompactionRequested = false;

    appendBatchDepth++;
    try {
      for (let i = 0; i < inputs.length; i++) {
        if (acceptedCount >= maxRecords) {
          rejected += inputs.length - i;
          break;
        }
        const size = maxBytes === Number.POSITIVE_INFINITY ? 0 : estimateJsonBytes(inputs[i] as unknown as JsonValue);
        if (bytes + size > maxBytes) {
          rejected += inputs.length - i;
          break;
        }
        const result = appendStored(inputs[i], !deferBatchCompaction);
        if (!result.accepted || result.record === undefined) {
          rejected += inputs.length - i;
          break;
        }
        accepted[acceptedCount++] = cloneRecord(result.record);
        if (deferBatchCompaction) batchCompactionRequested = true;
        bytes += size;
      }
    } finally {
      appendBatchDepth--;
      if (batchCompactionRequested) compactAfterBatch = true;
      if (appendBatchDepth === 0 && compactAfterBatch) {
        compactAfterBatch = false;
        queueAppendCompaction();
        enforceCapacity();
      }
    }
    accepted.length = acceptedCount;

    return {
      records: accepted,
      rejected,
      nextOffset,
      highWatermark: readHighWatermark()
    };
  }

  function read(
    cursor: EventLogCursor | number | null = 0,
    readOptions: EventLogReadOptions = {}
  ): EventLogReadResult<T> {
    const requested = readCursorOffset(cursor);
    const firstAvailable = readFirstOffset();
    const start = Math.max(requested, firstAvailable);
    const limit = readOptions.limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(readOptions.limit));
    const maxBytes = readOptions.maxBytes === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(readOptions.maxBytes));
    let bytes = 0;
    let cursorOffset = start;
    const startIndex = findRecordIndex(start);

    if (maxBytes === Number.POSITIVE_INFINITY) {
      const count = limit === Number.POSITIVE_INFINITY
        ? records.length - startIndex
        : Math.min(limit, records.length - startIndex);
      const out = new Array<EventLogRecord<T>>(count);
      for (let i = 0; i < count; i++) {
        const record = records[startIndex + i];
        out[i] = cloneRecord(record);
        cursorOffset = record.offset + 1;
      }
      return {
        records: out,
        cursor: { offset: cursorOffset },
        firstOffset: firstAvailable,
        nextOffset,
        highWatermark: readHighWatermark(),
        truncated: requested < firstAvailable,
        lag: readLag(cursorOffset)
      };
    }

    const out: EventLogRecord<T>[] = [];
    for (let i = startIndex; i < records.length && out.length < limit; i++) {
      const record = records[i];
      const size = estimateJsonBytes(record as unknown as JsonValue);
      if (bytes + size > maxBytes) break;
      out[out.length] = cloneRecord(record);
      cursorOffset = record.offset + 1;
      bytes += size;
    }

    return {
      records: out,
      cursor: { offset: cursorOffset },
      firstOffset: firstAvailable,
      nextOffset,
      highWatermark: readHighWatermark(),
      truncated: requested < firstAvailable,
      lag: readLag(cursorOffset)
    };
  }

  function createConsumer(id: string, cursor: EventLogCursor | number | null = readFirstOffset()): EventLogConsumer<T> {
    if (typeof id !== 'string' || id.length === 0) throw new TypeError('event log consumer id must be a non-empty string');
    const existing = consumers.get(id);
    if (existing !== undefined) return existing;
    const consumer = new EventLogConsumerImpl(id, readCursorOffset(cursor), read, readLag);
    consumers.set(id, consumer);
    return consumer;
  }

  function compact(compactOptions: EventLogCompactOptions = {}): number {
    const dropNulls = compactOptions.dropTombstones === undefined ? dropTombstones : compactOptions.dropTombstones === true;
    const keep = new Uint8Array(records.length);
    const seen = new Set<string>();
    let keyed = false;
    for (let i = records.length - 1; i >= 0; i--) {
      const record = records[i];
      const key = record.key;
      if (key === undefined) {
        keep[i] = 1;
        continue;
      }
      keyed = true;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!(dropNulls && record.value === null)) keep[i] = 1;
    }
    if (!keyed) return 0;
    let write = 0;
    for (let readIndex = 0; readIndex < records.length; readIndex++) {
      if (keep[readIndex] !== 0) records[write++] = records[readIndex];
    }
    const removed = records.length - write;
    if (removed !== 0) {
      records.length = write;
      compacted += removed;
    }
    return removed;
  }

  function truncateBefore(cursor: EventLogCursor | number): number {
    const offset = readCursorOffset(cursor);
    let remove = 0;
    while (remove < records.length && records[remove].offset < offset) remove++;
    if (remove === 0) return 0;
    records.splice(0, remove);
    dropped += remove;
    return remove;
  }

  function clear(): void {
    dropped += records.length;
    records.length = 0;
  }

  function getStats(): EventLogStats {
    return {
      records: records.length,
      firstOffset: readFirstOffset(),
      nextOffset,
      highWatermark: readHighWatermark(),
      appended,
      dropped,
      compacted,
      consumers: consumers.size
    };
  }

  function enforceCapacity(): void {
    if (records.length <= capacity) return;
    const remove = records.length - capacity;
    records.splice(0, remove);
    dropped += remove;
  }

  function queueAppendCompaction(): void {
    if (appendBatchDepth !== 0 && capacity === Number.POSITIVE_INFINITY) {
      compactAfterBatch = true;
      return;
    }
    if (scheduler !== undefined) {
      scheduleCompaction();
      return;
    }
    compact();
  }

  function scheduleCompaction(): void {
    if (compactionScheduled) return;
    compactionScheduled = true;
    try {
      scheduler?.schedule({
        id: 'frontier.event-log.compact:' + ++compactionTaskSeq,
        type: 'frontier.event-log.compact',
        lane: schedulerLane,
        area: 'event-log',
        priority: schedulerPriority,
        units: 1,
        key: 'frontier.event-log.compact',
        metadata: { records: records.length, nextOffset },
        run() {
          compactionScheduled = false;
          compact();
          enforceCapacity();
        }
      });
    } catch (error) {
      compactionScheduled = false;
      throw error;
    }
    if (schedulerAutoRun) {
      if (typeof scheduler?.requestRun === 'function') scheduler.requestRun(options.schedulerRunOptions);
      else if (typeof scheduler?.run === 'function') scheduler.run(options.schedulerRunOptions);
    }
  }

  function readFirstOffset(): number {
    return records.length === 0 ? nextOffset : records[0].offset;
  }

  function readHighWatermark(): number {
    return nextOffset - 1;
  }

  function readLag(offset: number): number {
    return Math.max(0, nextOffset - Math.max(0, Math.floor(offset)));
  }

  function findRecordIndex(offset: number): number {
    let low = 0;
    let high = records.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (records[mid].offset < offset) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  return {
    get firstOffset() {
      return readFirstOffset();
    },
    get nextOffset() {
      return nextOffset;
    },
    get highWatermark() {
      return readHighWatermark();
    },
    append,
    tryAppend,
    appendBatch,
    read,
    createConsumer,
    compact,
    truncateBefore,
    clear,
    getStats
  };
}

export function createEventLogCheckpoint<TSnapshot>(
  log: EventLog,
  snapshot: TSnapshot,
  options: EventLogCheckpointOptions = {}
): EventLogCheckpoint<TSnapshot> {
  return {
    cursor: { offset: readCursorOffset(options.cursor === undefined ? log.nextOffset : options.cursor) },
    snapshot: cloneStorageValue(snapshot),
    timestamp: options.timestamp === undefined ? Date.now() : Number(options.timestamp),
    highWatermark: log.highWatermark,
    ...(options.metadata === undefined ? {} : { metadata: cloneJson(options.metadata) })
  };
}

export function replayEventLog<TState, TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  checkpoint: EventLogCheckpoint<TState>,
  reducer: EventLogReplayReducer<TState, TValue>,
  options: EventLogReplayOptions = {}
): EventLogReplayResult<TState> {
  if (typeof reducer !== 'function') throw new TypeError('event log replay reducer must be a function');
  const batchSize = options.batchSize === undefined ? 256 : Math.max(1, Math.floor(options.batchSize));
  const maxBytes = options.maxBytesPerRead === undefined ? undefined : Math.max(0, Math.floor(options.maxBytesPerRead));
  let state = cloneStorageValue(checkpoint.snapshot);
  let cursor = readCursorOffset(checkpoint.cursor);
  let replayed = 0;
  let truncated = false;

  for (;;) {
    const readOptions: EventLogReadOptions = { limit: batchSize };
    if (maxBytes !== undefined) readOptions.maxBytes = maxBytes;
    const result = log.read(cursor, readOptions);
    if (result.truncated) {
      truncated = true;
      if (options.strict !== false) {
        throw new RangeError('event log replay checkpoint was truncated before offset ' + cursor);
      }
    }
    for (let i = 0; i < result.records.length; i++) {
      state = reducer(state, result.records[i]);
      replayed++;
    }
    cursor = result.cursor.offset;
    if (result.records.length === 0 || cursor >= log.nextOffset) break;
  }

  return {
    state,
    cursor: { offset: cursor },
    checkpoint: createEventLogCheckpoint(log, state, {
      cursor,
      timestamp: checkpoint.timestamp,
      metadata: checkpoint.metadata
    }),
    replayed,
    truncated,
    highWatermark: log.highWatermark
  };
}

export function summarizeAgentReplay<TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  options: AgentReplaySummaryOptions<TValue> = {}
): AgentReplaySummary {
  if (log === null || typeof log !== 'object' || typeof log.read !== 'function') {
    throw new TypeError('event log agent replay summary requires an event log');
  }
  const classify = options.classify === undefined ? classifyAgentReplayRecord : options.classify;
  if (typeof classify !== 'function') throw new TypeError('event log agent replay summary classifier must be a function');

  const batchSize = options.batchSize === undefined ? 256 : Math.max(1, Math.floor(options.batchSize));
  const maxBytes = options.maxBytesPerRead === undefined ? undefined : Math.max(0, Math.floor(options.maxBytesPerRead));
  let cursor = readCursorOffset(options.cursor);
  const summary: AgentReplaySummary = {
    started: 0,
    finished: 0,
    failed: 0,
    question: 0,
    decision: 0,
    applied: 0,
    records: 0,
    matchedRecords: 0,
    cursor: { offset: cursor },
    firstOffset: log.firstOffset,
    nextOffset: log.nextOffset,
    highWatermark: log.highWatermark,
    truncated: false
  };

  for (;;) {
    const readOptions: EventLogReadOptions = { limit: batchSize };
    if (maxBytes !== undefined) readOptions.maxBytes = maxBytes;
    const result = log.read(cursor, readOptions);
    summary.firstOffset = result.firstOffset;
    summary.nextOffset = result.nextOffset;
    summary.highWatermark = result.highWatermark;
    summary.cursor = result.cursor;
    if (result.truncated) {
      summary.truncated = true;
      if (options.strict === true) {
        throw new RangeError('event log agent replay summary was truncated before offset ' + cursor);
      }
    }

    for (let i = 0; i < result.records.length; i++) {
      summary.records++;
      const matched = collectAgentReplaySummaryKinds(classify(result.records[i]));
      if (matched.length === 0) continue;
      summary.matchedRecords++;
      for (let j = 0; j < matched.length; j++) summary[matched[j]]++;
    }

    cursor = result.cursor.offset;
    if (result.records.length === 0 || cursor >= result.nextOffset) break;
  }

  return summary;
}

export function summarizeAutonomousDecisionReplay<TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  options: AutonomousDecisionReplayOptions<TValue> = {}
): AutonomousDecisionReplaySummary<TValue> {
  if (log === null || typeof log !== 'object' || typeof log.read !== 'function') {
    throw new TypeError('event log autonomous decision replay summary requires an event log');
  }
  const classify = options.classify === undefined ? classifyAutonomousDecisionReplayRecord : options.classify;
  if (typeof classify !== 'function') {
    throw new TypeError('event log autonomous decision replay summary classifier must be a function');
  }
  const resolveQueueSubject = options.resolveQueueSubject === undefined
    ? resolveAutonomousDecisionReplaySubjects
    : options.resolveQueueSubject;
  if (typeof resolveQueueSubject !== 'function') {
    throw new TypeError('event log autonomous decision replay summary queue subject resolver must be a function');
  }
  const scan = collectAutonomousDecisionReplayEntries(log, classify, resolveQueueSubject, {
    cursor: options.cursor,
    batchSize: options.batchSize,
    maxBytesPerRead: options.maxBytesPerRead,
    strict: options.strict
  });
  const componentByAlias = new Map<string, AutonomousDecisionReplayComponent<TValue>>();
  const components = new Set<AutonomousDecisionReplayComponent<TValue>>();
  const summary: AutonomousDecisionReplaySummary<TValue> = {
    records: scan.records,
    matchedRecords: scan.matchedRecords,
    applied: 0,
    committed: 0,
    rejected: 0,
    rerun: 0,
    superseded: 0,
    conflictBlocked: 0,
    humanBlocked: 0,
    terminalRecords: 0,
    openRecords: 0,
    subjects: [],
    byQueueSubject: Object.create(null),
    byAlias: Object.create(null),
    latestTerminalByQueueSubject: Object.create(null),
    latestOpenByQueueSubject: Object.create(null),
    cursor: scan.cursor,
    firstOffset: scan.firstOffset,
    nextOffset: scan.nextOffset,
    highWatermark: scan.highWatermark,
    truncated: scan.truncated
  };

  for (let i = 0; i < scan.entries.length; i++) {
    const entry = scan.entries[i];
    const component = upsertAutonomousDecisionReplayComponent(
      components,
      componentByAlias,
      entry.record,
      entry.status,
      entry.queueSubjects
    );
    incrementAutonomousDecisionReplayStatusSummary(summary, entry.status);
    if (isAutonomousDecisionReplayTerminalStatus(entry.status)) summary.terminalRecords++;
    else summary.openRecords++;
    incrementAutonomousDecisionReplayComponentStatus(component, entry.status);
    if (compareAutonomousDecisionReplayRecords(entry.record, component.currentRecord) >= 0) {
      component.currentRecord = entry.record;
      component.status = entry.status;
    }
    if (
      isAutonomousDecisionReplayTerminalStatus(entry.status)
      && (component.terminalRecord === null || compareAutonomousDecisionReplayRecords(entry.record, component.terminalRecord) >= 0)
    ) {
      component.terminalStatus = entry.status;
      component.terminalRecord = entry.record;
    }
  }

  const subjects = Array.from(components)
    .map((component) => materializeAutonomousDecisionReplaySubject(component))
    .sort((left, right) => {
      const byCurrent = compareAutonomousDecisionReplayRecords(right.currentRecord, left.currentRecord);
      if (byCurrent !== 0) return byCurrent;
      if (right.lastOffset !== left.lastOffset) return right.lastOffset - left.lastOffset;
      return left.queueSubject.localeCompare(right.queueSubject);
    });

  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    summary.byQueueSubject[subject.queueSubject] = subject;
    for (let j = 0; j < subject.queueSubjectAliases.length; j++) {
      summary.byAlias[subject.queueSubjectAliases[j]] = subject;
    }
    if (subject.terminalStatus !== null) summary.latestTerminalByQueueSubject[subject.queueSubject] = subject;
    if (subject.status === 'rerun' || subject.status === 'human-blocked' || subject.status === 'conflict-blocked') {
      summary.latestOpenByQueueSubject[subject.queueSubject] = subject;
    }
  }
  summary.subjects = subjects;

  return summary;
}

export function replayAutonomousDecisionRecords<TState, TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  checkpoint: EventLogCheckpoint<TState>,
  reducer: EventLogReplayReducer<TState, TValue>,
  options: AutonomousDecisionReplayOptions<TValue> = {}
): EventLogReplayResult<TState> {
  if (typeof reducer !== 'function') throw new TypeError('event log autonomous decision replay reducer must be a function');
  if (log === null || typeof log !== 'object' || typeof log.read !== 'function') {
    throw new TypeError('event log autonomous decision replay requires an event log');
  }
  const classify = options.classify === undefined ? classifyAutonomousDecisionReplayRecord : options.classify;
  if (typeof classify !== 'function') {
    throw new TypeError('event log autonomous decision replay classifier must be a function');
  }
  const resolveQueueSubject = options.resolveQueueSubject === undefined
    ? resolveAutonomousDecisionReplaySubjects
    : options.resolveQueueSubject;
  if (typeof resolveQueueSubject !== 'function') {
    throw new TypeError('event log autonomous decision replay queue subject resolver must be a function');
  }

  const scan = collectAutonomousDecisionReplayEntries(log, classify, resolveQueueSubject, {
    cursor: options.cursor,
    batchSize: options.batchSize,
    maxBytesPerRead: options.maxBytesPerRead,
    strict: options.strict
  });
  let state = cloneStorageValue(checkpoint.snapshot);
  for (let i = 0; i < scan.entries.length; i++) {
    state = reducer(state, scan.entries[i].record);
  }

  return {
    state,
    cursor: scan.cursor,
    checkpoint: createEventLogCheckpoint(log, state, {
      cursor: scan.cursor.offset,
      timestamp: checkpoint.timestamp,
      metadata: checkpoint.metadata
    }),
    replayed: scan.entries.length,
    truncated: scan.truncated,
    highWatermark: scan.highWatermark
  };
}

export function stateAtTime<TState, TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  checkpoint: EventLogCheckpoint<TState>,
  reducer: EventLogReplayReducer<TState, TValue>,
  options: EventLogStateAtTimeOptions = {}
): EventLogTemporalStateResult<TState> {
  if (typeof reducer !== 'function') throw new TypeError('event log stateAtTime reducer must be a function');
  const target = normalizeTemporalPoint(options.at === undefined ? log.nextOffset : options.at);
  const checkpointCursor = readCursorOffset(checkpoint.cursor);
  const batchSize = options.batchSize === undefined ? 256 : Math.max(1, Math.floor(options.batchSize));
  const maxBytes = options.maxBytesPerRead === undefined ? undefined : Math.max(0, Math.floor(options.maxBytesPerRead));
  let state = cloneStorageValue(checkpoint.snapshot);
  let cursor = checkpointCursor;
  let replayed = 0;
  let truncated = false;

  if (target.kind === 'offset' && target.offset < checkpointCursor) {
    if (options.strict !== false) throw new RangeError('event log temporal target precedes checkpoint offset ' + checkpointCursor);
    return makeTemporalStateResult(log, checkpoint, state, cursor, replayed, true);
  }
  if (target.kind === 'timestamp' && target.timestamp < Number(checkpoint.timestamp)) {
    if (options.strict !== false) throw new RangeError('event log temporal target precedes checkpoint timestamp ' + checkpoint.timestamp);
    return makeTemporalStateResult(log, checkpoint, state, cursor, replayed, true);
  }

  for (;;) {
    if (target.kind === 'offset' && cursor >= target.offset) break;
    const readOptions: EventLogReadOptions = { limit: batchSize };
    if (maxBytes !== undefined) readOptions.maxBytes = maxBytes;
    const result = log.read(cursor, readOptions);
    if (result.truncated) {
      truncated = true;
      if (options.strict !== false) {
        throw new RangeError('event log temporal checkpoint was truncated before offset ' + cursor);
      }
    }

    let stopped = false;
    for (let i = 0; i < result.records.length; i++) {
      const record = result.records[i];
      if (temporalPointStopsBeforeRecord(target, record)) {
        stopped = true;
        break;
      }
      state = reducer(state, record);
      cursor = record.offset + 1;
      replayed++;
    }
    if (stopped || result.records.length === 0 || cursor >= log.nextOffset) break;
  }

  return makeTemporalStateResult(log, checkpoint, state, cursor, replayed, truncated);
}

export function diffBetweenTimes<TState extends JsonValue, TValue extends JsonValue = JsonValue>(
  log: EventLog<TValue>,
  checkpoint: EventLogCheckpoint<TState>,
  reducer: EventLogReplayReducer<TState, TValue>,
  options: EventLogDiffBetweenTimesOptions<TState>
): EventLogTemporalDiffResult<TState> {
  if (options === null || typeof options !== 'object') throw new TypeError('event log temporal diff options must be an object');
  const fromTarget = normalizeTemporalPoint(options.from);
  const toTarget = normalizeTemporalPoint(options.to);
  if (temporalPointPrecedes(toTarget, fromTarget)) throw new RangeError('event log temporal diff end precedes start');
  const from = stateAtTime(log, checkpoint, reducer, { ...options, at: options.from });
  const toCheckpoint: EventLogCheckpoint<TState> = {
    cursor: from.cursor,
    snapshot: from.state,
    timestamp: from.checkpoint.timestamp,
    highWatermark: from.highWatermark,
    metadata: from.checkpoint.metadata
  };
  const to = stateAtTime(log, toCheckpoint, reducer, { ...options, at: options.to });
  const diffFn = options.diff || ((before: TState, after: TState) => diffJson(before, after));
  return {
    before: cloneStorageValue(from.state),
    after: cloneStorageValue(to.state),
    patch: diffFn(from.state, to.state),
    from,
    to,
    replayed: from.replayed + to.replayed,
    truncated: from.truncated || to.truncated,
    highWatermark: log.highWatermark
  };
}

export function applyPatchEventRecord<TState extends JsonValue>(
  state: TState,
  record: EventLogRecord<PatchEventLogValue>
): TState {
  if (record.value.kind !== 'patch' || !Array.isArray(record.value.patch)) {
    throw new TypeError('event log record is not a Frontier patch event');
  }
  return applyPatch(state, record.value.patch, { cloneValues: true }) as TState;
}

export function createEventLogReplayStorage<TSnapshot = JsonValue, TEntry = JsonValue>(
  options: EventLogReplayStorageOptions<TSnapshot> = {}
): EventLogReplayStorage<TSnapshot, TEntry> {
  const log = options.log || createEventLog<JsonValue>({ capacity: options.capacity, now: options.now });
  let checkpoint: EventLogCheckpoint<TSnapshot | null> | null = options.initialCheckpoint === undefined || options.initialCheckpoint === null
    ? null
    : cloneCheckpoint(options.initialCheckpoint);
  let snapshot: TSnapshot | null = options.initialSnapshot === undefined
    ? checkpoint === null ? null : cloneStorageValue(checkpoint.snapshot)
    : cloneStorageValue(options.initialSnapshot);

  function load(): TSnapshot | null {
    return snapshot === null ? null : cloneStorageValue(snapshot);
  }

  function save(next: TSnapshot): void {
    snapshot = cloneStorageValue(next);
  }

  function appendChange(entry: TEntry): EventLogRecord<JsonValue> {
    return log.append({ value: cloneStorageValue(entry) as JsonValue });
  }

  function readChangeLog(options: EventLogReplayStorageReadOptions = {}): TEntry[] {
    const limit = options.limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(options.limit));
    if (limit === 0) return [];
    const cursor = options.cursor === undefined ? log.firstOffset : options.cursor;
    const result = log.read(cursor, {
      maxBytes: options.maxBytes
    });
    const out: TEntry[] = [];
    for (let i = 0; i < result.records.length; i++) {
      const value = result.records[i].value;
      if (options.sinceSeq !== undefined && readEntrySeq(value) <= options.sinceSeq) continue;
      out[out.length] = cloneStorageValue(value as TEntry);
      if (out.length >= limit) break;
    }
    return out;
  }

  function compact(next?: TSnapshot): EventLogCheckpoint<TSnapshot | null> {
    if (next !== undefined) save(next);
    checkpoint = createEventLogCheckpoint(log, snapshot, {
      cursor: log.nextOffset,
      timestamp: options.now === undefined ? Date.now() : options.now()
    });
    log.truncateBefore(checkpoint.cursor);
    return cloneCheckpoint(checkpoint);
  }

  function clear(): void {
    snapshot = null;
    checkpoint = null;
    log.clear();
  }

  function getCheckpoint(): EventLogCheckpoint<TSnapshot | null> | null {
    return checkpoint === null ? null : cloneCheckpoint(checkpoint);
  }

  function getStats(): EventLogReplayStorageStats {
    return {
      checkpointed: checkpoint !== null,
      checkpointOffset: checkpoint === null ? 0 : checkpoint.cursor.offset,
      log: log.getStats()
    };
  }

  return {
    log,
    load,
    save,
    appendChange,
    readChangeLog,
    compact,
    clear,
    getCheckpoint,
    getStats
  };
}

export function appendPatchEvent(
  log: EventLog<PatchEventLogValue>,
  patch: Patch,
  options: PatchEventLogOptions = {}
): EventLogRecord<PatchEventLogValue> {
  const value: PatchEventLogValue = {
    kind: 'patch',
    patch: cloneJson(patch as unknown as JsonValue) as unknown as Patch
  };
  if (options.metadata !== undefined) value.metadata = cloneJson(options.metadata);
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value
  });
}

export function appendAutonomousDecisionAppliedEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'applied', value, options);
}

export function appendAutonomousDecisionCommittedEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'committed', value, options);
}

export function appendAutonomousDecisionRejectedEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'rejected', value, options);
}

export function appendAutonomousDecisionRerunEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'rerun', value, options);
}

export function appendAutonomousDecisionSupersededEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'superseded', value, options);
}

export function appendAutonomousDecisionConflictBlockedEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'conflict-blocked', value, options);
}

export function appendAutonomousDecisionHumanBlockedEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  return appendAutonomousDecisionReplayEvent(log, 'human-blocked', value, options);
}

export function appendCoordinatorGateSelectedEvent(
  log: EventLog<CoordinatorGateEventValue>,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  return appendCoordinatorGateEvent(log, 'gate.selected', 'selected', value, options);
}

export function appendCoordinatorGateStartedEvent(
  log: EventLog<CoordinatorGateEventValue>,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  return appendCoordinatorGateEvent(log, 'gate.started', 'started', value, options);
}

export function appendCoordinatorGatePassedEvent(
  log: EventLog<CoordinatorGateEventValue>,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  return appendCoordinatorGateEvent(log, 'gate.passed', 'passed', value, options);
}

export function appendCoordinatorGateFailedEvent(
  log: EventLog<CoordinatorGateEventValue>,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  return appendCoordinatorGateEvent(log, 'gate.failed', 'failed', value, options);
}

export function appendCoordinatorGateSkippedEvent(
  log: EventLog<CoordinatorGateEventValue>,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  return appendCoordinatorGateEvent(log, 'gate.skipped', 'skipped', value, options);
}

export type ContinuousPoolLifecycleEventKind =
  | 'pool.started'
  | 'worker.leased'
  | 'worker.finished'
  | 'bundle.collected'
  | 'decision.written'
  | 'patch.applied'
  | 'queue.refilled'
  | 'human.blocked'
  | 'pool.drained';

export interface ContinuousPoolLifecycleEventValue extends JsonObject {
  kind: ContinuousPoolLifecycleEventKind;
  run?: string;
  worker?: string;
  task?: string;
  lane?: string;
  decision?: string;
  leaseScope?: string;
  leaseScopes?: string[];
}

export type ContinuousPoolLifecycleEventFields = Omit<ContinuousPoolLifecycleEventValue, 'kind'>;

export function appendContinuousPoolStartedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'pool.started', value, options);
}

export function appendContinuousPoolWorkerLeasedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'worker.leased', value, options);
}

export function appendContinuousPoolWorkerFinishedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'worker.finished', value, options);
}

export function appendContinuousPoolBundleCollectedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'bundle.collected', value, options);
}

export function appendContinuousPoolDecisionWrittenEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'decision.written', value, options);
}

export function appendContinuousPoolPatchAppliedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'patch.applied', value, options);
}

export function appendContinuousPoolQueueRefilledEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'queue.refilled', value, options);
}

export function appendContinuousPoolHumanBlockedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'human.blocked', value, options);
}

export function appendContinuousPoolDrainedEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  return appendContinuousPoolLifecycleEvent(log, 'pool.drained', value, options);
}

export type BundleSynthesisDecision =
  | 'expected'
  | 'written'
  | 'generated'
  | 'missing'
  | 'no-change'
  | 'synthesized'
  | 'rejected';

export type BundleSynthesisEventKind =
  | 'bundle.expected'
  | 'bundle.written'
  | 'patch.generated'
  | 'patch.missing'
  | 'no-change.evidence'
  | 'collector.synthesized'
  | 'bundle.rejected';

export interface BundleSynthesisEventValue extends JsonObject {
  kind: BundleSynthesisEventKind;
  decision: BundleSynthesisDecision;
  bundleId?: string;
  collector?: string;
  run?: string;
  task?: string;
  lane?: string;
  bundlePath?: string;
  patchPath?: string;
  evidencePaths?: string[];
  changedPaths?: string[];
  changedRegions?: string[];
  reasons?: string[];
}

export type BundleSynthesisEventFields = Omit<
  BundleSynthesisEventValue,
  'kind' | 'decision' | 'evidencePaths' | 'changedPaths' | 'changedRegions' | 'reasons'
> & {
  evidencePaths?: readonly string[];
  changedPaths?: readonly string[];
  changedRegions?: readonly string[];
  reasons?: readonly string[];
};

export function appendBundleExpectedEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'bundle.expected', value, options);
}

export function appendBundleWrittenEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'bundle.written', value, options);
}

export function appendPatchGeneratedEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'patch.generated', value, options);
}

export function appendPatchMissingEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'patch.missing', value, options);
}

export function appendNoChangeEvidenceEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'no-change.evidence', value, options);
}

export function appendCollectorSynthesizedEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'collector.synthesized', value, options);
}

export function appendBundleRejectedEvent(
  log: EventLog<BundleSynthesisEventValue>,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  return appendBundleSynthesisEvent(log, 'bundle.rejected', value, options);
}

export type SemanticChangeStreamEventKind =
  | 'slice.claimed'
  | 'slice.applied'
  | 'lease.acquired'
  | 'lease.released'
  | 'merge.promoted'
  | 'merge.superseded';

export interface SemanticChangeStreamEventValue extends JsonObject {
  kind: SemanticChangeStreamEventKind;
  semanticRegionKey?: string;
  semanticRegionKeys?: string[];
  sourceHead?: string;
  sourceHeads?: string[];
  currentHead?: string;
  currentHeads?: string[];
  taskId?: string;
  taskIds?: string[];
  leaseKey?: string;
  leaseKeys?: string[];
  leaseId?: string;
  sliceId?: string;
  mergeId?: string;
  promotionParent?: string;
  promotionParents?: string[];
  supersedingMergeId?: string;
}

export type SemanticChangeStreamEventFields = Omit<SemanticChangeStreamEventValue, 'kind'>;

export interface SemanticChangeStreamEventFilterOptions {
  kind?: SemanticChangeStreamEventKind | readonly SemanticChangeStreamEventKind[];
  semanticRegionKey?: string | readonly string[];
  leaseKey?: string | readonly string[];
  taskId?: string | readonly string[];
  promotionParent?: string | readonly string[];
}

export interface SemanticChangeStreamReplayOptions extends EventLogReplayOptions, SemanticChangeStreamEventFilterOptions {}

export function appendSemanticSliceClaimedEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'slice.claimed', value, options);
}

export function appendSemanticSliceAppliedEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'slice.applied', value, options);
}

export function appendSemanticLeaseAcquiredEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'lease.acquired', value, options);
}

export function appendSemanticLeaseReleasedEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'lease.released', value, options);
}

export function appendSemanticMergePromotedEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'merge.promoted', value, options);
}

export function appendSemanticMergeSupersededEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  return appendSemanticChangeStreamEvent(log, 'merge.superseded', value, options);
}

export function filterSemanticChangeStreamEvents<TValue extends SemanticChangeStreamEventValue>(
  records: readonly EventLogRecord<TValue>[],
  options: SemanticChangeStreamEventFilterOptions = {}
): EventLogRecord<TValue>[] {
  const kindFilter = normalizeSemanticChangeStreamFilter(options.kind);
  const regionFilter = normalizeSemanticChangeStreamFilter(options.semanticRegionKey);
  const leaseFilter = normalizeSemanticChangeStreamFilter(options.leaseKey);
  const taskFilter = normalizeSemanticChangeStreamFilter(options.taskId);
  const promotionParentFilter = normalizeSemanticChangeStreamFilter(options.promotionParent);
  const filtered: EventLogRecord<TValue>[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (matchesSemanticChangeStreamEvent(record.value, kindFilter, regionFilter, leaseFilter, taskFilter, promotionParentFilter)) {
      filtered.push(record);
    }
  }
  return filtered;
}

export function replaySemanticChangeStreamEvents<TState, TValue extends SemanticChangeStreamEventValue = SemanticChangeStreamEventValue>(
  log: EventLog<TValue>,
  checkpoint: EventLogCheckpoint<TState>,
  reducer: EventLogReplayReducer<TState, TValue>,
  options: SemanticChangeStreamReplayOptions = {}
): EventLogReplayResult<TState> {
  if (typeof reducer !== 'function') throw new TypeError('event log semantic change stream replay reducer must be a function');
  const kindFilter = normalizeSemanticChangeStreamFilter(options.kind);
  const regionFilter = normalizeSemanticChangeStreamFilter(options.semanticRegionKey);
  const leaseFilter = normalizeSemanticChangeStreamFilter(options.leaseKey);
  const taskFilter = normalizeSemanticChangeStreamFilter(options.taskId);
  const promotionParentFilter = normalizeSemanticChangeStreamFilter(options.promotionParent);

  return replayEventLog(
    log,
    checkpoint,
    (state, record) => {
      if (!matchesSemanticChangeStreamEvent(record.value, kindFilter, regionFilter, leaseFilter, taskFilter, promotionParentFilter)) {
        return state;
      }
      return reducer(state, record);
    },
    options
  );
}

export type ModelRoutingFeedbackEventKind =
  | 'model.chosen'
  | 'model.outcome'
  | 'tournament.observation'
  | 'rsi.recommendation';

export interface ModelRoutingFeedbackEventValue extends JsonObject {
  kind: ModelRoutingFeedbackEventKind;
  taskKind?: string;
  model?: string;
}

export type ModelRoutingFeedbackEventFields = Omit<ModelRoutingFeedbackEventValue, 'kind'>;

export interface ModelRoutingFeedbackEventFilterOptions {
  kind?: ModelRoutingFeedbackEventKind | readonly ModelRoutingFeedbackEventKind[];
  taskKind?: string | readonly string[];
  model?: string | readonly string[];
}

export function appendModelChosenEvent(
  log: EventLog<ModelRoutingFeedbackEventValue>,
  value: ModelRoutingFeedbackEventFields,
  options: Omit<EventLogAppendInput<ModelRoutingFeedbackEventValue>, 'value'> = {}
): EventLogRecord<ModelRoutingFeedbackEventValue> {
  return appendModelRoutingFeedbackEvent(log, 'model.chosen', value, options);
}

export function appendModelOutcomeEvent(
  log: EventLog<ModelRoutingFeedbackEventValue>,
  value: ModelRoutingFeedbackEventFields,
  options: Omit<EventLogAppendInput<ModelRoutingFeedbackEventValue>, 'value'> = {}
): EventLogRecord<ModelRoutingFeedbackEventValue> {
  return appendModelRoutingFeedbackEvent(log, 'model.outcome', value, options);
}

export function appendTournamentObservationEvent(
  log: EventLog<ModelRoutingFeedbackEventValue>,
  value: ModelRoutingFeedbackEventFields,
  options: Omit<EventLogAppendInput<ModelRoutingFeedbackEventValue>, 'value'> = {}
): EventLogRecord<ModelRoutingFeedbackEventValue> {
  return appendModelRoutingFeedbackEvent(log, 'tournament.observation', value, options);
}

export function appendRsiRecommendationEvent(
  log: EventLog<ModelRoutingFeedbackEventValue>,
  value: ModelRoutingFeedbackEventFields,
  options: Omit<EventLogAppendInput<ModelRoutingFeedbackEventValue>, 'value'> = {}
): EventLogRecord<ModelRoutingFeedbackEventValue> {
  return appendModelRoutingFeedbackEvent(log, 'rsi.recommendation', value, options);
}

export function filterModelRoutingFeedbackEvents<TValue extends ModelRoutingFeedbackEventValue>(
  records: readonly EventLogRecord<TValue>[],
  options: ModelRoutingFeedbackEventFilterOptions = {}
): EventLogRecord<TValue>[] {
  const kindFilter = normalizeModelRoutingFeedbackFilter(options.kind);
  const taskKindFilter = normalizeModelRoutingFeedbackFilter(options.taskKind);
  const modelFilter = normalizeModelRoutingFeedbackFilter(options.model);
  const filtered: EventLogRecord<TValue>[] = [];
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (matchesModelRoutingFeedbackEvent(record.value, kindFilter, taskKindFilter, modelFilter)) {
      filtered.push(record);
    }
  }
  return filtered;
}

function appendModelRoutingFeedbackEvent(
  log: EventLog<ModelRoutingFeedbackEventValue>,
  kind: ModelRoutingFeedbackEventKind,
  value: ModelRoutingFeedbackEventFields,
  options: Omit<EventLogAppendInput<ModelRoutingFeedbackEventValue>, 'value'> = {}
): EventLogRecord<ModelRoutingFeedbackEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log model routing feedback event value must be an object');
  }
  (payload as ModelRoutingFeedbackEventValue).kind = kind;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload as ModelRoutingFeedbackEventValue
  });
}

function appendAutonomousDecisionReplayEvent(
  log: EventLog<AutonomousDecisionReplayRecordValue>,
  kind: AutonomousDecisionReplayStatus,
  value: AutonomousDecisionReplayRecordFields,
  options: Omit<EventLogAppendInput<AutonomousDecisionReplayRecordValue>, 'value'> = {}
): EventLogRecord<AutonomousDecisionReplayRecordValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log autonomous decision replay event value must be an object');
  }
  (payload as AutonomousDecisionReplayRecordValue).kind = kind;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload as AutonomousDecisionReplayRecordValue
  });
}

function appendCoordinatorGateEvent(
  log: EventLog<CoordinatorGateEventValue>,
  kind: CoordinatorGateEventKind,
  status: CoordinatorGateEventStatus,
  value: CoordinatorGateEventFields,
  options: Omit<EventLogAppendInput<CoordinatorGateEventValue>, 'value'> = {}
): EventLogRecord<CoordinatorGateEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log coordinator gate event value must be an object');
  }
  const event = payload as CoordinatorGateEventValue;
  event.kind = kind;
  event.status = status;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: event
  });
}

function appendContinuousPoolLifecycleEvent(
  log: EventLog<ContinuousPoolLifecycleEventValue>,
  kind: ContinuousPoolLifecycleEventKind,
  value: ContinuousPoolLifecycleEventFields,
  options: Omit<EventLogAppendInput<ContinuousPoolLifecycleEventValue>, 'value'> = {}
): EventLogRecord<ContinuousPoolLifecycleEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log continuous pool lifecycle event value must be an object');
  }
  (payload as ContinuousPoolLifecycleEventValue).kind = kind;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload as ContinuousPoolLifecycleEventValue
  });
}

function appendBundleSynthesisEvent(
  log: EventLog<BundleSynthesisEventValue>,
  kind: BundleSynthesisEventKind,
  value: BundleSynthesisEventFields,
  options: Omit<EventLogAppendInput<BundleSynthesisEventValue>, 'value'> = {}
): EventLogRecord<BundleSynthesisEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log bundle synthesis event value must be an object');
  }
  const event = payload as BundleSynthesisEventValue;
  event.kind = kind;
  event.decision = bundleSynthesisDecisionFromKind(kind);
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: event
  });
}

function appendSemanticChangeStreamEvent(
  log: EventLog<SemanticChangeStreamEventValue>,
  kind: SemanticChangeStreamEventKind,
  value: SemanticChangeStreamEventFields,
  options: Omit<EventLogAppendInput<SemanticChangeStreamEventValue>, 'value'> = {}
): EventLogRecord<SemanticChangeStreamEventValue> {
  const payload = cloneJson(value) as JsonValue;
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('event log semantic change stream event value must be an object');
  }
  (payload as SemanticChangeStreamEventValue).kind = kind;
  return log.append({
    key: options.key,
    timestamp: options.timestamp,
    headers: options.headers,
    value: payload as SemanticChangeStreamEventValue
  });
}

function bundleSynthesisDecisionFromKind(kind: BundleSynthesisEventKind): BundleSynthesisDecision {
  switch (kind) {
    case 'bundle.expected':
      return 'expected';
    case 'bundle.written':
      return 'written';
    case 'patch.generated':
      return 'generated';
    case 'patch.missing':
      return 'missing';
    case 'no-change.evidence':
      return 'no-change';
    case 'collector.synthesized':
      return 'synthesized';
    case 'bundle.rejected':
      return 'rejected';
  }
}

function normalizeSemanticChangeStreamFilter(
  value?: string | readonly string[] | SemanticChangeStreamEventKind | readonly SemanticChangeStreamEventKind[]
): readonly string[] | null {
  if (value === undefined) return null;
  const values = Array.isArray(value) ? value : [value];
  const out: string[] = [];
  for (let i = 0; i < values.length; i++) {
    const candidate = String(values[i]).trim();
    if (candidate.length === 0 || out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
}

function matchesSemanticChangeStreamEvent(
  value: JsonValue,
  kindFilter: readonly string[] | null,
  regionFilter: readonly string[] | null,
  leaseFilter: readonly string[] | null,
  taskFilter: readonly string[] | null,
  promotionParentFilter: readonly string[] | null
): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const event = value as SemanticChangeStreamEventValue;
  if (kindFilter !== null && !kindFilter.includes(event.kind)) return false;
  if (regionFilter !== null && !matchesSemanticChangeStreamField(event.semanticRegionKey, event.semanticRegionKeys, regionFilter)) return false;
  if (leaseFilter !== null && !matchesSemanticChangeStreamField(event.leaseKey, event.leaseKeys, leaseFilter)) return false;
  if (taskFilter !== null && !matchesSemanticChangeStreamField(event.taskId, event.taskIds, taskFilter)) return false;
  if (promotionParentFilter !== null && !matchesSemanticChangeStreamField(event.promotionParent, event.promotionParents, promotionParentFilter)) return false;
  return true;
}

function matchesSemanticChangeStreamField(
  value: string | undefined,
  values: readonly string[] | undefined,
  filter: readonly string[]
): boolean {
  if (value !== undefined && matchesSemanticChangeStreamString(value, filter)) return true;
  if (values === undefined) return false;
  for (let i = 0; i < values.length; i++) {
    if (matchesSemanticChangeStreamString(values[i], filter)) return true;
  }
  return false;
}

function matchesSemanticChangeStreamString(value: string, filter: readonly string[]): boolean {
  const normalized = String(value).trim();
  if (normalized.length === 0) return false;
  return filter.includes(normalized);
}

function normalizeModelRoutingFeedbackFilter(
  value?: string | readonly string[] | ModelRoutingFeedbackEventKind | readonly ModelRoutingFeedbackEventKind[]
): readonly string[] | null {
  if (value === undefined) return null;
  const values = Array.isArray(value) ? value : [value];
  const out: string[] = [];
  for (let i = 0; i < values.length; i++) {
    const candidate = String(values[i]).trim();
    if (candidate.length === 0 || out.includes(candidate)) continue;
    out.push(candidate);
  }
  return out;
}

function matchesModelRoutingFeedbackEvent(
  value: JsonValue,
  kindFilter: readonly string[] | null,
  taskKindFilter: readonly string[] | null,
  modelFilter: readonly string[] | null
): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const event = value as ModelRoutingFeedbackEventValue;
  if (kindFilter !== null && !kindFilter.includes(event.kind)) return false;
  if (taskKindFilter !== null && !matchesModelRoutingFeedbackField(event.taskKind, taskKindFilter)) return false;
  if (modelFilter !== null && !matchesModelRoutingFeedbackField(event.model, modelFilter)) return false;
  return true;
}

function matchesModelRoutingFeedbackField(value: string | undefined, filter: readonly string[]): boolean {
  if (value === undefined) return false;
  const normalized = String(value).trim();
  if (normalized.length === 0) return false;
  return filter.includes(normalized);
}

class EventLogConsumerImpl<T extends JsonValue> implements EventLogConsumer<T> {
  private position: number;
  private committedOffset: number;
  private readonly readFromLog: (cursor?: EventLogCursor | number | null, options?: EventLogReadOptions) => EventLogReadResult<T>;
  private readonly readLagFromLog: (offset: number) => number;

  constructor(
    readonly id: string,
    offset: number,
    readFromLog: (cursor?: EventLogCursor | number | null, options?: EventLogReadOptions) => EventLogReadResult<T>,
    readLagFromLog: (offset: number) => number
  ) {
    this.position = offset;
    this.committedOffset = offset;
    this.readFromLog = readFromLog;
    this.readLagFromLog = readLagFromLog;
  }

  get cursor(): EventLogCursor {
    return { offset: this.position };
  }

  get committed(): EventLogCursor {
    return { offset: this.committedOffset };
  }

  read(options: EventLogReadOptions = {}): EventLogReadResult<T> {
    const result = this.readFromLog(this.position, options);
    this.position = result.cursor.offset;
    return result;
  }

  ack(cursor: EventLogCursor | number = this.position): EventLogCursor {
    const offset = readCursorOffset(cursor);
    this.committedOffset = offset;
    if (this.position < offset) this.position = offset;
    return { offset };
  }

  seek(cursor: EventLogCursor | number): EventLogCursor {
    this.position = readCursorOffset(cursor);
    return { offset: this.position };
  }

  lag(): number {
    return this.readLagFromLog(this.position);
  }
}

function cloneRecord<T extends JsonValue>(record: EventLogRecord<T>): EventLogRecord<T> {
  const out: EventLogRecord<T> = {
    offset: record.offset,
    timestamp: record.timestamp,
    value: cloneJson(record.value)
  };
  if (record.key !== undefined) out.key = record.key;
  if (record.headers !== undefined) out.headers = cloneJson(record.headers);
  return out;
}

interface AutonomousDecisionReplayComponent<TValue extends JsonValue = JsonValue> {
  queueSubject: string;
  aliases: Set<string>;
  records: number;
  firstOffset: number;
  lastOffset: number;
  applied: number;
  committed: number;
  rejected: number;
  rerun: number;
  superseded: number;
  conflictBlocked: number;
  humanBlocked: number;
  status: AutonomousDecisionReplayStatus;
  terminalStatus: AutonomousDecisionReplayTerminalStatus | null;
  currentRecord: EventLogRecord<TValue>;
  terminalRecord: EventLogRecord<TValue> | null;
}

function incrementAutonomousDecisionReplayStatusSummary(
  summary: AutonomousDecisionReplaySummary<JsonValue>,
  status: AutonomousDecisionReplayStatus
): void {
  switch (status) {
    case 'applied':
      summary.applied++;
      return;
    case 'committed':
      summary.committed++;
      return;
    case 'rejected':
      summary.rejected++;
      return;
    case 'rerun':
      summary.rerun++;
      return;
    case 'superseded':
      summary.superseded++;
      return;
    case 'conflict-blocked':
      summary.conflictBlocked++;
      return;
    case 'human-blocked':
      summary.humanBlocked++;
      return;
  }
}

function incrementAutonomousDecisionReplayComponentStatus(
  component: AutonomousDecisionReplayComponent<JsonValue>,
  status: AutonomousDecisionReplayStatus
): void {
  switch (status) {
    case 'applied':
      component.applied++;
      return;
    case 'committed':
      component.committed++;
      return;
    case 'rejected':
      component.rejected++;
      return;
    case 'rerun':
      component.rerun++;
      return;
    case 'superseded':
      component.superseded++;
      return;
    case 'conflict-blocked':
      component.conflictBlocked++;
      return;
    case 'human-blocked':
      component.humanBlocked++;
      return;
  }
}

function isAutonomousDecisionReplayTerminalStatus(
  status: AutonomousDecisionReplayStatus
): status is AutonomousDecisionReplayTerminalStatus {
  return status === 'applied' || status === 'committed' || status === 'rejected' || status === 'superseded';
}

function uniqueAutonomousDecisionReplaySubjects(
  input: AutonomousDecisionReplaySubjectResult
): string[] {
  const out: string[] = [];
  if (input === null || input === undefined || input === false) return out;
  const values = Array.isArray(input) ? input : [input];
  for (let i = 0; i < values.length; i++) {
    const candidate = String(values[i]).trim();
    if (candidate.length === 0 || out.includes(candidate)) continue;
    out[out.length] = candidate;
  }
  return out;
}

function upsertAutonomousDecisionReplayComponent<TValue extends JsonValue>(
  components: Set<AutonomousDecisionReplayComponent<TValue>>,
  componentByAlias: Map<string, AutonomousDecisionReplayComponent<TValue>>,
  record: EventLogRecord<TValue>,
  status: AutonomousDecisionReplayStatus,
  queueSubjects: readonly string[]
): AutonomousDecisionReplayComponent<TValue> {
  const matches: AutonomousDecisionReplayComponent<TValue>[] = [];
  for (let i = 0; i < queueSubjects.length; i++) {
    const match = componentByAlias.get(queueSubjects[i]);
    if (match !== undefined && !matches.includes(match)) matches.push(match);
  }

  let component = matches[0];
  for (let i = 1; i < matches.length; i++) {
    if (compareAutonomousDecisionReplayComponents(matches[i], component) < 0) component = matches[i];
  }
  if (component === undefined) {
    component = createAutonomousDecisionReplayComponent(record, status, queueSubjects);
    components.add(component);
    for (let i = 0; i < queueSubjects.length; i++) {
      componentByAlias.set(queueSubjects[i], component);
    }
    return component;
  }

  for (let i = 1; i < matches.length; i++) {
    component = mergeAutonomousDecisionReplayComponents(component, matches[i], componentByAlias, components);
  }

  for (let i = 0; i < queueSubjects.length; i++) {
    component.aliases.add(queueSubjects[i]);
    componentByAlias.set(queueSubjects[i], component);
  }

  return component;
}

function compareAutonomousDecisionReplayComponents<TValue extends JsonValue>(
  left: AutonomousDecisionReplayComponent<TValue>,
  right: AutonomousDecisionReplayComponent<TValue>
): number {
  if (left.firstOffset !== right.firstOffset) return left.firstOffset - right.firstOffset;
  return left.queueSubject.localeCompare(right.queueSubject);
}

function createAutonomousDecisionReplayComponent<TValue extends JsonValue>(
  record: EventLogRecord<TValue>,
  status: AutonomousDecisionReplayStatus,
  queueSubjects: readonly string[]
): AutonomousDecisionReplayComponent<TValue> {
  const aliases = new Set<string>();
  for (let i = 0; i < queueSubjects.length; i++) aliases.add(queueSubjects[i]);
  return {
    queueSubject: queueSubjects[0],
    aliases,
    records: 0,
    firstOffset: record.offset,
    lastOffset: record.offset,
    applied: 0,
    committed: 0,
    rejected: 0,
    rerun: 0,
    superseded: 0,
    conflictBlocked: 0,
    humanBlocked: 0,
    status,
    terminalStatus: isAutonomousDecisionReplayTerminalStatus(status) ? status : null,
    currentRecord: record,
    terminalRecord: isAutonomousDecisionReplayTerminalStatus(status) ? record : null
  };
}

function mergeAutonomousDecisionReplayComponents<TValue extends JsonValue>(
  target: AutonomousDecisionReplayComponent<TValue>,
  source: AutonomousDecisionReplayComponent<TValue>,
  componentByAlias: Map<string, AutonomousDecisionReplayComponent<TValue>>,
  components: Set<AutonomousDecisionReplayComponent<TValue>>
): AutonomousDecisionReplayComponent<TValue> {
  if (target === source) return target;
  if (
    source.firstOffset < target.firstOffset
    || (source.firstOffset === target.firstOffset && source.queueSubject.localeCompare(target.queueSubject) < 0)
  ) {
    const swapped = target;
    target = source;
    source = swapped;
  }

  target.records += source.records;
  target.applied += source.applied;
  target.committed += source.committed;
  target.rejected += source.rejected;
  target.rerun += source.rerun;
  target.superseded += source.superseded;
  target.conflictBlocked += source.conflictBlocked;
  target.humanBlocked += source.humanBlocked;
  if (source.firstOffset < target.firstOffset) target.firstOffset = source.firstOffset;
  if (source.lastOffset > target.lastOffset) target.lastOffset = source.lastOffset;
  if (compareAutonomousDecisionReplayRecords(source.currentRecord, target.currentRecord) > 0) {
    target.currentRecord = source.currentRecord;
    target.status = source.status;
  }
  if (
    source.terminalRecord !== null
    && (target.terminalRecord === null || compareAutonomousDecisionReplayRecords(source.terminalRecord, target.terminalRecord) > 0)
  ) {
    target.terminalRecord = source.terminalRecord;
    target.terminalStatus = source.terminalStatus;
  }
  for (const alias of source.aliases) {
    target.aliases.add(alias);
    componentByAlias.set(alias, target);
  }
  components.delete(source);
  return target;
}

function materializeAutonomousDecisionReplaySubject<TValue extends JsonValue>(
  component: AutonomousDecisionReplayComponent<TValue>
): AutonomousDecisionReplaySubjectSummary<TValue> {
  const queueSubjectAliases = Array.from(component.aliases).sort((left, right) => left.localeCompare(right));
  return {
    queueSubject: component.queueSubject,
    queueSubjectAliases,
    records: component.records,
    firstOffset: component.firstOffset,
    lastOffset: component.lastOffset,
    applied: component.applied,
    committed: component.committed,
    rejected: component.rejected,
    rerun: component.rerun,
    superseded: component.superseded,
    conflictBlocked: component.conflictBlocked,
    humanBlocked: component.humanBlocked,
    status: component.status,
    terminalStatus: component.terminalStatus,
    currentRecord: cloneRecord(component.currentRecord),
    terminalRecord: component.terminalRecord === null ? null : cloneRecord(component.terminalRecord)
  };
}

function readCursorOffset(cursor: EventLogCursor | number | null | undefined): number {
  if (cursor === null || cursor === undefined) return 0;
  if (typeof cursor === 'number') return Math.max(0, Math.floor(cursor));
  return Math.max(0, Math.floor(cursor.offset || 0));
}

function cloneCheckpoint<TSnapshot>(checkpoint: EventLogCheckpoint<TSnapshot>): EventLogCheckpoint<TSnapshot> {
  return {
    cursor: { offset: readCursorOffset(checkpoint.cursor) },
    snapshot: cloneStorageValue(checkpoint.snapshot),
    timestamp: Number(checkpoint.timestamp),
    highWatermark: Math.floor(Number(checkpoint.highWatermark) || 0),
    ...(checkpoint.metadata === undefined ? {} : { metadata: cloneJson(checkpoint.metadata) })
  };
}

const AGENT_REPLAY_SUMMARY_KINDS: AgentReplaySummaryKind[] = [
  'started',
  'finished',
  'failed',
  'question',
  'decision',
  'applied'
];

const AGENT_REPLAY_SUMMARY_FIELDS = [
  'type',
  'kind',
  'event',
  'name',
  'action',
  'status',
  'phase',
  'state',
  'outcome'
];

function classifyAgentReplayRecord<TValue extends JsonValue>(record: EventLogRecord<TValue>): AgentReplaySummaryKind[] {
  const matches = new Set<AgentReplaySummaryKind>();
  collectAgentReplaySummaryValue(record.value, matches);
  if (record.headers !== undefined) collectAgentReplaySummaryValue(record.headers, matches);
  return orderAgentReplaySummaryKinds(matches);
}

function collectAgentReplaySummaryValue(value: JsonValue, matches: Set<AgentReplaySummaryKind>): void {
  if (typeof value === 'string') {
    collectAgentReplaySummaryText(value, matches);
    return;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return;
  const object = value as JsonObject;
  for (let i = 0; i < AGENT_REPLAY_SUMMARY_FIELDS.length; i++) {
    const candidate = object[AGENT_REPLAY_SUMMARY_FIELDS[i]];
    if (typeof candidate === 'string') collectAgentReplaySummaryText(candidate, matches);
  }
}

function collectAgentReplaySummaryText(text: string, matches: Set<AgentReplaySummaryKind>): void {
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
  for (let i = 0; i < tokens.length; i++) {
    const kind = matchAgentReplaySummaryToken(tokens[i]);
    if (kind !== null) matches.add(kind);
  }
}

function matchAgentReplaySummaryToken(token: string): AgentReplaySummaryKind | null {
  switch (token) {
    case 'start':
    case 'started':
    case 'spawned':
      return 'started';
    case 'finish':
    case 'finished':
    case 'complete':
    case 'completed':
    case 'succeeded':
      return 'finished';
    case 'fail':
    case 'failed':
    case 'error':
    case 'errored':
      return 'failed';
    case 'question':
    case 'questions':
    case 'asked':
      return 'question';
    case 'decision':
    case 'decisions':
    case 'decided':
      return 'decision';
    case 'apply':
    case 'applied':
    case 'merged':
      return 'applied';
    default:
      return null;
  }
}

function collectAgentReplaySummaryKinds(result: AgentReplaySummaryClassifierResult): AgentReplaySummaryKind[] {
  const matches = new Set<AgentReplaySummaryKind>();
  if (Array.isArray(result)) {
    for (let i = 0; i < result.length; i++) addAgentReplaySummaryKind(result[i], matches);
  } else if (typeof result === 'string') {
    addAgentReplaySummaryKind(result, matches);
  }
  return orderAgentReplaySummaryKinds(matches);
}

function addAgentReplaySummaryKind(kind: string, matches: Set<AgentReplaySummaryKind>): void {
  for (let i = 0; i < AGENT_REPLAY_SUMMARY_KINDS.length; i++) {
    if (kind === AGENT_REPLAY_SUMMARY_KINDS[i]) {
      matches.add(AGENT_REPLAY_SUMMARY_KINDS[i]);
      return;
    }
  }
}

function orderAgentReplaySummaryKinds(matches: Set<AgentReplaySummaryKind>): AgentReplaySummaryKind[] {
  const ordered: AgentReplaySummaryKind[] = [];
  for (let i = 0; i < AGENT_REPLAY_SUMMARY_KINDS.length; i++) {
    const kind = AGENT_REPLAY_SUMMARY_KINDS[i];
    if (matches.has(kind)) ordered[ordered.length] = kind;
  }
  return ordered;
}

type NormalizedTemporalPoint =
  | { kind: 'offset'; offset: number }
  | { kind: 'timestamp'; timestamp: number; inclusive: boolean };

function normalizeTemporalPoint(point: EventLogTemporalPoint): NormalizedTemporalPoint {
  if (typeof point === 'number') return { kind: 'offset', offset: Math.max(0, Math.floor(point)) };
  if (point === null || typeof point !== 'object') throw new TypeError('event log temporal point must be an offset, cursor, or timestamp object');
  if ('timestamp' in point && point.timestamp !== undefined) {
    const timestamp = Number(point.timestamp);
    if (!Number.isFinite(timestamp)) throw new TypeError('event log temporal timestamp must be finite');
    return { kind: 'timestamp', timestamp, inclusive: point.inclusive !== false };
  }
  if ('highWatermark' in point && point.highWatermark !== undefined) {
    const highWatermark = Number(point.highWatermark);
    if (!Number.isFinite(highWatermark)) throw new TypeError('event log temporal highWatermark must be finite');
    return { kind: 'offset', offset: Math.max(0, Math.floor(highWatermark) + 1) };
  }
  if ('offset' in point && point.offset !== undefined) {
    const offset = Number(point.offset);
    if (!Number.isFinite(offset)) throw new TypeError('event log temporal offset must be finite');
    return { kind: 'offset', offset: Math.max(0, Math.floor(offset)) };
  }
  if ('cursor' in point && point.cursor !== undefined) {
    return { kind: 'offset', offset: readCursorOffset(point.cursor) };
  }
  return { kind: 'offset', offset: readCursorOffset(point as EventLogCursor) };
}

function temporalPointStopsBeforeRecord<T extends JsonValue>(
  target: NormalizedTemporalPoint,
  record: EventLogRecord<T>
): boolean {
  if (target.kind === 'offset') return record.offset >= target.offset;
  return target.inclusive ? record.timestamp > target.timestamp : record.timestamp >= target.timestamp;
}

function temporalPointPrecedes(left: NormalizedTemporalPoint, right: NormalizedTemporalPoint): boolean {
  if (left.kind !== right.kind) return false;
  if (left.kind === 'offset' && right.kind === 'offset') return left.offset < right.offset;
  if (left.kind === 'timestamp' && right.kind === 'timestamp') return left.timestamp < right.timestamp;
  return false;
}

function makeTemporalStateResult<TState>(
  log: EventLog,
  checkpoint: EventLogCheckpoint<TState>,
  state: TState,
  cursor: number,
  replayed: number,
  truncated: boolean
): EventLogTemporalStateResult<TState> {
  return {
    state: cloneStorageValue(state),
    cursor: { offset: cursor },
    checkpoint: createEventLogCheckpoint(log, state, {
      cursor,
      timestamp: checkpoint.timestamp,
      metadata: checkpoint.metadata
    }),
    replayed,
    truncated,
    highWatermark: log.highWatermark
  };
}

function cloneStorageValue<T>(value: T): T {
  return cloneJson(value as unknown as JsonValue) as unknown as T;
}

function readEntrySeq(value: JsonValue): number {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const seq = Number((value as JsonObject).seq);
    if (Number.isFinite(seq)) return seq;
  }
  return Number.POSITIVE_INFINITY;
}

const AUTONOMOUS_DECISION_REPLAY_STATUS_ORDER: AutonomousDecisionReplayStatus[] = [
  'human-blocked',
  'conflict-blocked',
  'rerun',
  'superseded',
  'committed',
  'applied',
  'rejected'
];

const AUTONOMOUS_DECISION_REPLAY_STATUS_FIELDS = [
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
  'decisionReason'
];

const AUTONOMOUS_DECISION_REPLAY_STATUS_PATTERNS: Array<{
  status: AutonomousDecisionReplayStatus;
  normalized: readonly string[];
  tokens?: readonly string[];
}> = [
  {
    status: 'human-blocked',
    normalized: ['humanblocked', 'blockedhuman'],
    tokens: ['human', 'blocked']
  },
  {
    status: 'conflict-blocked',
    normalized: ['conflictblocked', 'blockedconflict', 'conflictstalled'],
    tokens: ['conflict', 'blocked']
  },
  {
    status: 'rerun',
    normalized: ['rerun', 'rerunwork', 'retry', 'requeue', 'stale', 'staleagainsthead'],
    tokens: ['rerun']
  },
  {
    status: 'superseded',
    normalized: ['superseded', 'supersede', 'superseding'],
    tokens: ['superseded']
  },
  {
    status: 'committed',
    normalized: ['committed', 'commit'],
    tokens: ['committed']
  },
  {
    status: 'applied',
    normalized: ['applied', 'apply', 'merged'],
    tokens: ['applied']
  },
  {
    status: 'rejected',
    normalized: ['rejected', 'reject', 'denied'],
    tokens: ['rejected']
  }
];

const AUTONOMOUS_DECISION_REPLAY_SUBJECT_FIELDS = [
  'queueSubject',
  'queueSubjectAlias',
  'subject',
  'queueKey',
  'jobId',
  'taskId',
  'key',
  'alias',
  'queueItemId',
  'queueSubjectAliases',
  'queueSubjects',
  'queueKeys',
  'queueItemIds',
  'subjectAliases',
  'aliases',
  'subjects'
] as const;

interface AutonomousDecisionReplayEntry<TValue extends JsonValue = JsonValue> {
  record: EventLogRecord<TValue>;
  status: AutonomousDecisionReplayStatus;
  queueSubjects: readonly string[];
}

interface AutonomousDecisionReplayScan<TValue extends JsonValue = JsonValue> {
  entries: AutonomousDecisionReplayEntry<TValue>[];
  records: number;
  matchedRecords: number;
  cursor: EventLogCursor;
  firstOffset: number;
  nextOffset: number;
  highWatermark: number;
  truncated: boolean;
}

function classifyAutonomousDecisionReplayRecord<TValue extends JsonValue>(
  record: EventLogRecord<TValue>
): AutonomousDecisionReplayClassifierResult {
  const matches = new Set<AutonomousDecisionReplayStatus>();
  collectAutonomousDecisionReplayValue(record.value, matches);
  if (record.headers !== undefined) collectAutonomousDecisionReplayValue(record.headers, matches);
  return orderAutonomousDecisionReplayStatuses(matches);
}

function resolveAutonomousDecisionReplaySubjects<TValue extends JsonValue>(
  record: EventLogRecord<TValue>
): AutonomousDecisionReplaySubjectResult {
  const subjects = new Set<string>();
  collectAutonomousDecisionReplaySubjects(record.value, subjects);
  if (record.headers !== undefined) collectAutonomousDecisionReplaySubjects(record.headers, subjects);
  if (record.key !== undefined) subjects.add(String(record.key).trim());
  return Array.from(subjects).filter((subject) => subject.length > 0);
}

function collectAutonomousDecisionReplayEntries<TValue extends JsonValue>(
  log: EventLog<TValue>,
  classify: AutonomousDecisionReplayClassifier<TValue>,
  resolveQueueSubject: AutonomousDecisionReplaySubjectResolver<TValue>,
  options: Pick<AutonomousDecisionReplayOptions<TValue>, 'cursor' | 'batchSize' | 'maxBytesPerRead' | 'strict'>
): AutonomousDecisionReplayScan<TValue> {
  const batchSize = options.batchSize === undefined ? 256 : Math.max(1, Math.floor(options.batchSize));
  const maxBytes = options.maxBytesPerRead === undefined ? undefined : Math.max(0, Math.floor(options.maxBytesPerRead));
  let cursor = readCursorOffset(options.cursor);
  const entries: AutonomousDecisionReplayEntry<TValue>[] = [];
  let records = 0;
  let matchedRecords = 0;
  let firstOffset = log.firstOffset;
  let nextOffset = log.nextOffset;
  let highWatermark = log.highWatermark;
  let truncated = false;

  for (;;) {
    const readOptions: EventLogReadOptions = { limit: batchSize };
    if (maxBytes !== undefined) readOptions.maxBytes = maxBytes;
    const result = log.read(cursor, readOptions);
    firstOffset = result.firstOffset;
    nextOffset = result.nextOffset;
    highWatermark = result.highWatermark;
    if (result.truncated) {
      truncated = true;
      if (options.strict === true) {
        throw new RangeError('event log autonomous decision replay was truncated before offset ' + cursor);
      }
    }

    for (let i = 0; i < result.records.length; i++) {
      records++;
      const record = result.records[i];
      const status = classify(record);
      if (status === null || status === undefined || status === false) continue;
      const queueSubjects = uniqueAutonomousDecisionReplaySubjects(resolveQueueSubject(record));
      if (queueSubjects.length === 0) continue;
      matchedRecords++;
      entries.push({ record, status, queueSubjects });
    }

    cursor = result.cursor.offset;
    if (result.records.length === 0 || cursor >= result.nextOffset) break;
  }

  entries.sort(compareAutonomousDecisionReplayEntries);

  return {
    entries,
    records,
    matchedRecords,
    cursor: { offset: cursor },
    firstOffset,
    nextOffset,
    highWatermark,
    truncated
  };
}

function collectAutonomousDecisionReplayValue(value: JsonValue, matches: Set<AutonomousDecisionReplayStatus>): void {
  if (typeof value === 'string') {
    collectAutonomousDecisionReplayText(value, matches);
    return;
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return;
  const object = value as JsonObject;
  for (let i = 0; i < AUTONOMOUS_DECISION_REPLAY_STATUS_FIELDS.length; i++) {
    const candidate = object[AUTONOMOUS_DECISION_REPLAY_STATUS_FIELDS[i]];
    if (typeof candidate === 'string') collectAutonomousDecisionReplayText(candidate, matches);
  }
}

function collectAutonomousDecisionReplaySubjects(value: JsonValue, subjects: Set<string>): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return;
  const object = value as JsonObject;
  for (let i = 0; i < AUTONOMOUS_DECISION_REPLAY_SUBJECT_FIELDS.length; i++) {
    const field = AUTONOMOUS_DECISION_REPLAY_SUBJECT_FIELDS[i];
    const candidate = object[field];
    if (typeof candidate === 'string') {
      subjects.add(String(candidate).trim());
      continue;
    }
    if (Array.isArray(candidate)) {
      for (let j = 0; j < candidate.length; j++) {
        if (typeof candidate[j] === 'string') subjects.add(String(candidate[j]).trim());
      }
    }
  }
}

function collectAutonomousDecisionReplayText(text: string, matches: Set<AutonomousDecisionReplayStatus>): void {
  const normalized = text.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/);
  for (let i = 0; i < AUTONOMOUS_DECISION_REPLAY_STATUS_PATTERNS.length; i++) {
    const pattern = AUTONOMOUS_DECISION_REPLAY_STATUS_PATTERNS[i];
    if (pattern.normalized.some((candidate) => candidate === normalized)) {
      matches.add(pattern.status);
      continue;
    }
    if (pattern.tokens !== undefined && pattern.tokens.every((token) => tokens.includes(token))) {
      matches.add(pattern.status);
    }
  }
}

function compareAutonomousDecisionReplayEntries<TValue extends JsonValue>(
  left: AutonomousDecisionReplayEntry<TValue>,
  right: AutonomousDecisionReplayEntry<TValue>
): number {
  if (left.record.timestamp !== right.record.timestamp) return left.record.timestamp - right.record.timestamp;
  if (left.record.offset !== right.record.offset) return left.record.offset - right.record.offset;
  return 0;
}

function compareAutonomousDecisionReplayRecords<TValue extends JsonValue>(
  left: EventLogRecord<TValue>,
  right: EventLogRecord<TValue>
): number {
  if (left.timestamp !== right.timestamp) return left.timestamp - right.timestamp;
  if (left.offset !== right.offset) return left.offset - right.offset;
  return 0;
}

function orderAutonomousDecisionReplayStatuses(matches: Set<AutonomousDecisionReplayStatus>): AutonomousDecisionReplayStatus | null {
  for (let i = 0; i < AUTONOMOUS_DECISION_REPLAY_STATUS_ORDER.length; i++) {
    const status = AUTONOMOUS_DECISION_REPLAY_STATUS_ORDER[i];
    if (matches.has(status)) return status;
  }
  return null;
}

function estimateJsonBytes(value: JsonValue): number {
  return JSON.stringify(value).length;
}
