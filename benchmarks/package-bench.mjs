import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { diff } from '@shapeshift-labs/frontier';
import {
  applyPatchEventRecord,
  appendPatchEvent,
  createEventLog,
  createEventLogCheckpoint,
  createEventLogReplayStorage,
  diffBetweenTimes,
  stateAtTime,
  replayEventLog
} from '../dist/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const rounds = readPositiveInt(args.rounds, 9);
const outPath = args.out ? path.resolve(rootDir, args.out) : null;
let sink = 0;

const patch = diff(
  { rows: [{ id: 'a', score: 1 }], meta: { tick: 0 } },
  { rows: [{ id: 'a', score: 2 }, { id: 'b', score: 3 }], meta: { tick: 1 } },
  { arrayKey: 'id' }
);
const replayLog = seededLog(4096);
const consumerLog = seededLog(512);
const consumer = consumerLog.createConsumer('bench');
const temporalFixture = createTemporalFixture();
const compactBatchInputs = Array.from({ length: 1024 }, (_, i) => ({
  key: 'entity:' + (i & 127),
  value: { revision: i }
}));

const rows = [
  runRow('Append keyed JSON event', 4000, () => {
    const log = createEventLog({ capacity: 4096, now: () => 1 });
    let last = 0;
    for (let i = 0; i < 16; i++) last = log.append({ key: 'k' + (i & 15), value: { i, ok: true } }).offset;
    sink += last;
  }),
  runRow('Read replay window, 32 records', 3000, () => {
    const result = replayLog.read(3500, { limit: 32 });
    sink += result.records.length;
  }),
  runRow('Consumer read and ack', 3000, () => {
    consumer.seek(384);
    const result = consumer.read({ limit: 8 });
    consumer.ack();
    sink += result.records.length;
  }),
  runRow('Compact keyed log, 1k records', 80, () => {
    const log = createEventLog({ compactByKey: true, dropTombstones: true, now: () => 1 });
    for (let i = 0; i < 1024; i++) log.append({ key: 'entity:' + (i & 127), value: { revision: i } });
    sink += log.compact();
  }),
  runRow('Append batch compactOnAppend, 1k records', 80, () => {
    const log = createEventLog({ compactByKey: true, compactOnAppend: true, dropTombstones: true, now: () => 1 });
    sink += log.appendBatch(compactBatchInputs).records.length;
  }),
  runRow('Replay from checkpoint, 64 records', 1000, () => {
    const log = createEventLog({ now: () => 1 });
    for (let i = 0; i < 128; i++) log.append({ value: { delta: 1 } });
    const checkpoint = createEventLogCheckpoint(log, { total: 128 }, { timestamp: 1 });
    for (let i = 0; i < 64; i++) log.append({ value: { delta: 1 } });
    sink += replayEventLog(log, checkpoint, (state, record) => ({ total: state.total + record.value.delta })).state.total;
  }),
  runRow('State at offset, 64 patch events', 1000, () => {
    const result = stateAtTime(
      temporalFixture.log,
      temporalFixture.checkpoint,
      applyPatchEventRecord,
      { at: 64 }
    );
    sink += result.cursor.offset;
  }),
  runRow('Diff between offsets, 64 patch events', 1000, () => {
    const result = diffBetweenTimes(
      temporalFixture.log,
      temporalFixture.checkpoint,
      applyPatchEventRecord,
      { from: 16, to: 64 }
    );
    sink += result.patch.length;
  }),
  runRow('Replay storage append/read checkpoint', 1000, () => {
    const storage = createEventLogReplayStorage({ initialSnapshot: { count: 0 }, now: () => 1 });
    for (let i = 0; i < 32; i++) storage.appendChange({ seq: i + 1, type: 'change', value: i });
    sink += storage.readChangeLog({ sinceSeq: 16 }).length;
    sink += storage.compact({ count: 32 }).cursor.offset;
  }),
  runRow('Append Frontier patch event', 4000, () => {
    const log = createEventLog({ capacity: 128, now: () => 1 });
    sink += appendPatchEvent(log, patch, { key: 'doc:1', metadata: { tick: 1 } }).offset;
  })
];

finish('@shapeshift-labs/frontier-event-log', rows);

function seededLog(count) {
  const log = createEventLog({ capacity: count + 1, now: () => 1 });
  for (let i = 0; i < count; i++) log.append({ key: 'k' + (i & 255), value: { i, value: i & 7 } });
  return log;
}

function createTemporalFixture() {
  const log = createEventLog({ now: () => 1 });
  const checkpoint = createEventLogCheckpoint(log, { rows: [{ id: 'a', score: 0 }], meta: { tick: 0 } }, { timestamp: 1 });
  let current = checkpoint.snapshot;
  for (let i = 1; i <= 64; i++) {
    const next = {
      rows: [{ id: 'a', score: i }, { id: 'b', score: i & 7 }],
      meta: { tick: i }
    };
    appendPatchEvent(log, diff(current, next, { arrayKey: 'id' }), { timestamp: i + 1 });
    current = next;
  }
  return { log, checkpoint };
}

function measure(fn, inner) {
  for (let i = 0; i < inner; i++) fn();
  const samples = new Array(rounds);
  for (let roundIndex = 0; roundIndex < rounds; roundIndex++) {
    const start = performance.now();
    for (let i = 0; i < inner; i++) fn();
    samples[roundIndex] = ((performance.now() - start) * 1000) / inner;
  }
  samples.sort((left, right) => left - right);
  return { median: percentile(samples, 0.5), p95: percentile(samples, 0.95) };
}

function runRow(name, inner, fn, extra = {}) {
  const timing = measure(fn, inner);
  return { fixture: name, medianUs: round(timing.median), p95Us: round(timing.p95), ...extra };
}

function finish(packageName, rows) {
  const report = {
    package: packageName,
    version: readPackageVersion(),
    generatedAt: new Date().toISOString(),
    node: process.version,
    platform: process.platform + ' ' + process.arch,
    rounds,
    rows
  };
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
  }
  printReport(report);
  if (sink === 42) console.log('sink=' + sink);
}

function printReport(report) {
  console.log(report.package + ' package benchmark');
  console.log('Node ' + report.node + ' on ' + report.platform + ', rounds=' + rounds);
  console.log('These are Frontier-only package measurements, not competitor comparisons.');
  console.log('');
  console.log(padRight('Fixture', 38) + padLeft('Median', 12) + padLeft('p95', 11));
  for (const row of report.rows) {
    console.log(padRight(row.fixture, 38) + padLeft(formatUs(row.medianUs), 12) + padLeft(formatUs(row.p95Us), 11));
  }
  if (outPath) console.log('\nwrote ' + path.relative(rootDir, outPath));
}

function percentile(sorted, fraction) {
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))];
}

function readPackageVersion() {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--rounds') out.rounds = argv[++i];
    else if (arg === '--out') out.out = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: npm run bench -- [--rounds 9] [--out benchmarks/results/package-bench.json]');
      process.exit(0);
    } else {
      throw new Error('unknown argument: ' + arg);
    }
  }
  return out;
}

function readPositiveInt(value, fallback) {
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new Error('expected positive integer, got ' + value);
  return number;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function formatUs(value) {
  return value >= 1000 ? (value / 1000).toFixed(2) + ' ms' : value.toFixed(2) + ' us';
}

function padRight(value, width) {
  return String(value).padEnd(width);
}

function padLeft(value, width) {
  return String(value).padStart(width);
}
