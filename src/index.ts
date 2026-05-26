export {
  appendPatchEvent,
  createEventLog,
  createEventLogCheckpoint,
  createEventLogReplayStorage,
  replayEventLog
} from './event-log.js';

export type {
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
  EventLogStats,
  PatchEventLogOptions,
  PatchEventLogValue
} from './event-log.js';
