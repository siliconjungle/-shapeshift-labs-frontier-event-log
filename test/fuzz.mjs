import assert from 'node:assert';
import { createEventLog } from '../dist/index.js';

const args = parseArgs(process.argv.slice(2));
const cases = readPositiveInt(args.cases, 500);
const seed = readPositiveInt(args.seed, 0xe70109);
const rng = mulberry32(seed);

for (let id = 0; id < cases; id++) {
  runCase(id, mulberry32((rng() * 0xffffffff) >>> 0));
}

console.log('frontier event-log fuzz passed cases=' + cases + ' seed=' + seed);

function runCase(caseId, rng) {
  const capacity = 4 + randomInt(rng, 24);
  const compactByKey = randomInt(rng, 2) === 0;
  const log = createEventLog({
    capacity,
    compactByKey,
    compactOnAppend: randomInt(rng, 2) === 0,
    dropTombstones: randomInt(rng, 2) === 0,
    now: () => caseId
  });
  const consumer = log.createConsumer('fuzz');
  let lastHighWatermark = -1;

  for (let step = 0; step < 80; step++) {
    const choice = randomInt(rng, 8);
    if (choice < 4) {
      const result = log.tryAppend({
        key: randomInt(rng, 3) === 0 ? 'k' + randomInt(rng, 8) : undefined,
        value: randomInt(rng, 7) === 0 ? null : { step, value: randomInt(rng, 1000) }
      });
      assert.strictEqual(result.accepted, true);
      assert.ok(result.record.offset > lastHighWatermark);
      lastHighWatermark = result.record.offset;
    } else if (choice === 4) {
      const batchSize = randomInt(rng, 8);
      const batch = [];
      for (let i = 0; i < batchSize; i++) batch.push({ key: 'b' + (i & 3), value: { i, step } });
      const result = log.appendBatch(batch, { maxRecords: randomInt(rng, batchSize + 1) });
      assert.ok(result.records.length + result.rejected <= batchSize);
      for (const record of result.records) {
        assert.ok(record.offset > lastHighWatermark);
        lastHighWatermark = record.offset;
      }
    } else if (choice === 5) {
      log.compact();
    } else if (choice === 6) {
      consumer.read({ limit: randomInt(rng, 5) });
      consumer.ack();
    } else {
      consumer.seek(randomInt(rng, log.nextOffset + 1));
    }

    const stats = log.getStats();
    assert.ok(stats.records <= capacity);
    assert.strictEqual(stats.highWatermark, log.highWatermark);
    assert.strictEqual(stats.nextOffset, log.nextOffset);

    const replay = log.read(0, { limit: 1000 });
    let previous = -1;
    for (const record of replay.records) {
      assert.ok(record.offset > previous);
      previous = record.offset;
    }
    assert.ok(replay.cursor.offset <= log.nextOffset);
  }
}

function randomInt(rng, max) {
  return max <= 0 ? 0 : Math.floor(rng() * max);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--cases') out.cases = argv[++i];
    else if (arg === '--seed') out.seed = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: node test/fuzz.mjs [--cases 500] [--seed 15139081]');
      process.exit(0);
    } else {
      throw new Error('unknown argument: ' + arg);
    }
  }
  return out;
}

function readPositiveInt(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function mulberry32(seedValue) {
  let state = seedValue >>> 0;
  return function next() {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
