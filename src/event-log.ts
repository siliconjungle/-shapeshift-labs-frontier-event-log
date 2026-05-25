import { cloneJson } from '@shapeshift-labs/frontier/clone';
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
  initialOffset?: number;
  now?: () => number;
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
  clear(): void;
  getStats(): EventLogStats;
}

export interface EventLogCompactOptions {
  dropTombstones?: boolean;
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
  const records: EventLogRecord<T>[] = [];
  const consumers = new Map<string, EventLogConsumerImpl<T>>();
  let nextOffset = Math.max(0, Math.floor(options.initialOffset || 0));
  let appended = 0;
  let dropped = 0;
  let compacted = 0;

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

    if (compactByKey && compactOnAppend) compact();
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

    for (let i = 0; i < records.length && out.length < limit; i++) {
      const record = records[i];
      if (record.offset < start) continue;
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
    const latest = new Map<string, number>();
    for (let i = 0; i < records.length; i++) {
      const key = records[i].key;
      if (key !== undefined) latest.set(key, i);
    }
    if (latest.size === 0) return 0;

    let write = 0;
    for (let readIndex = 0; readIndex < records.length; readIndex++) {
      const record = records[readIndex];
      const key = record.key;
      const keep = key === undefined ||
        latest.get(key) === readIndex && !(dropNulls && record.value === null);
      if (keep) records[write++] = record;
    }
    const removed = records.length - write;
    if (removed !== 0) {
      records.length = write;
      compacted += removed;
    }
    return removed;
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

  function readFirstOffset(): number {
    return records.length === 0 ? nextOffset : records[0].offset;
  }

  function readHighWatermark(): number {
    return nextOffset - 1;
  }

  function readLag(offset: number): number {
    return Math.max(0, nextOffset - Math.max(0, Math.floor(offset)));
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
    clear,
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

function estimateJsonBytes(value: JsonValue): number {
  return JSON.stringify(value).length;
}
