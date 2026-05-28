import { diff, type JsonObject } from '@shapeshift-labs/frontier';
import {
  applyPatchEventRecord,
  appendPatchEvent,
  createEventLog,
  createEventLogCheckpoint,
  createEventLogReplayStorage,
  diffBetweenTimes,
  stateAtTime,
  replayEventLog,
  type EventLog,
  type EventLogCheckpoint,
  type EventLogConsumer,
  type EventLogCursor,
  type EventLogDiffBetweenTimesOptions,
  type EventLogReadResult,
  type EventLogRecord,
  type EventLogReplayResult,
  type EventLogReplayStorage,
  type EventLogSchedulerTask,
  type EventLogTemporalDiffResult,
  type EventLogTemporalPoint,
  type EventLogTemporalStateResult,
  type PatchEventLogValue
} from '../dist/index.js';
import { createEventLog as createEventLogSubpath } from '../dist/event-log.js';

const typedScheduler = {
  schedule(task: EventLogSchedulerTask): unknown {
    task.run();
    return task;
  }
};
const typedEventLog: EventLog<JsonObject> = createEventLog<JsonObject>({
  capacity: 128,
  scheduler: typedScheduler,
  schedulerAutoRun: true
});
const typedEventRecord: EventLogRecord<JsonObject> = typedEventLog.append({
  key: 'typed',
  value: { ok: true }
});
const typedEventRead: EventLogReadResult<JsonObject> = typedEventLog.read(typedEventRecord.offset, { limit: 1 });
const typedEventCursor: EventLogCursor = typedEventRead.cursor;
const typedEventConsumer: EventLogConsumer<JsonObject> = typedEventLog.createConsumer('typed', typedEventCursor);

const typedPatchLog: EventLog<PatchEventLogValue> = createEventLogSubpath<PatchEventLogValue>();
const typedPatch = diff({ count: 1 }, { count: 2 });
const typedPatchRecord: EventLogRecord<PatchEventLogValue> = appendPatchEvent(typedPatchLog, typedPatch, {
  metadata: { source: 'types' }
});
const typedCheckpoint: EventLogCheckpoint<JsonObject> = createEventLogCheckpoint(typedEventLog, { ok: true });
const typedReplay: EventLogReplayResult<JsonObject> = replayEventLog(typedEventLog, typedCheckpoint, (state, record) => ({
  ...state,
  lastOffset: record.offset
}));
const typedReplayStorage: EventLogReplayStorage<JsonObject, JsonObject> = createEventLogReplayStorage<JsonObject, JsonObject>({
  initialSnapshot: { ok: true }
});
typedReplayStorage.appendChange({ seq: 1, ok: true });
typedReplayStorage.compact({ ok: false });
const typedPatchCheckpoint: EventLogCheckpoint<JsonObject> = createEventLogCheckpoint(typedPatchLog, { count: 1 });
const typedTemporalPoint: EventLogTemporalPoint = { offset: typedPatchRecord.offset + 1 };
const typedTemporalState: EventLogTemporalStateResult<JsonObject> = stateAtTime(
  typedPatchLog,
  typedPatchCheckpoint,
  applyPatchEventRecord,
  { at: typedTemporalPoint }
);
const typedTemporalOptions: EventLogDiffBetweenTimesOptions<JsonObject> = {
  from: typedPatchCheckpoint.cursor,
  to: typedTemporalPoint
};
const typedTemporalDiff: EventLogTemporalDiffResult<JsonObject> = diffBetweenTimes(
  typedPatchLog,
  typedPatchCheckpoint,
  applyPatchEventRecord,
  typedTemporalOptions
);

void typedEventConsumer;
void typedPatchRecord;
void typedReplay;
void typedTemporalState;
void typedTemporalDiff;
