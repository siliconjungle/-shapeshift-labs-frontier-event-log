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

    if (compactByKey && compactOnAppend) queueAppendCompaction();
    enforceCapacity();
    return { accepted: true, record: cloneRecord(record) };
  }

  function appendBatch(inputs: readonly EventLogAppendInput<T>[], batchOptions: EventLogBatchOptions = {}): EventLogBatchAppendResult<T> {
    if (!Array.isArray(inputs)) throw new TypeError('event log appendBatch inputs must be an array');
    const maxRecords = batchOptions.maxRecords === undefined
      ? inputs.length
      : Math.max(0, Math.floor(batchOptions.maxRecords));
    const maxBytes = batchOptions.maxBytes === undefined
      ? Number.POSITIVE_INFINITY
      : Math.max(0, Math.floor(batchOptions.maxBytes));
    const accepted: EventLogRecord<T>[] = [];
    let bytes = 0;
    let rejected = 0;

    appendBatchDepth++;
    try {
      for (let i = 0; i < inputs.length; i++) {
        if (accepted.length >= maxRecords) {
          rejected += inputs.length - i;
          break;
        }
        const size = maxBytes === Number.POSITIVE_INFINITY ? 0 : estimateJsonBytes(inputs[i] as unknown as JsonValue);
        if (bytes + size > maxBytes) {
          rejected += inputs.length - i;
          break;
        }
        const result = tryAppend(inputs[i]);
        if (!result.accepted || result.record === undefined) {
          rejected += inputs.length - i;
          break;
        }
        accepted[accepted.length] = result.record;
        bytes += size;
      }
    } finally {
      appendBatchDepth--;
      if (appendBatchDepth === 0 && compactAfterBatch) {
        compactAfterBatch = false;
        queueAppendCompaction();
        enforceCapacity();
      }
    }

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
    const out: EventLogRecord<T>[] = [];
    let bytes = 0;
    let cursorOffset = start;
    const startIndex = findRecordIndex(start);

    for (let i = startIndex; i < records.length && out.length < limit; i++) {
      const record = records[i];
      const size = maxBytes === Number.POSITIVE_INFINITY ? 0 : estimateJsonBytes(record as unknown as JsonValue);
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

function estimateJsonBytes(value: JsonValue): number {
  return JSON.stringify(value).length;
}
