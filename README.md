# Frontier Event Log

Bounded in-memory event logs, replay cursors, key compaction, question lifecycle records, semantic change streams, coordinator gate lifecycle records, bundle synthesis lifecycle records, and Frontier patch events.

This package sits beside [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier), the small JSON diff/apply core package. It keeps event replay, cursor ownership, retention, and compaction out of state/cache packages while still using core JSON clone and patch types.

- npm: [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log)
- source: [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- license: MIT

## Related Packages

The published Frontier package family is generated from one shared package catalog so READMEs stay in sync across packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): Core JSON diff/apply, compact patch tuples, JSON Pointer, equality, clone, validation, Unicode helpers, and tiny dependency-free runtime budget/scheduler primitives.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): Shared query-key, selector path, condition, entity identity, and table-shape primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): Patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): Stateful planned diff engine, adaptive profiles, schema plans, and engine-level history helpers.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): Patch-routed app-state subscriptions, owned commits, maintained views, and path mapping.
- [`@shapeshift-labs/frontier-dataflow`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dataflow): Serializable incremental dataflow and materialized-view graphs for Frontier apps, including selectors, dependency DAGs, filters, joins, aggregations, stale paths, recompute budgets, output patches, provenance records, and proof of why derived views changed.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): Normalized query-result cache with entity/query watchers, persistence, change logs, optimistic layers, scheduled persistence, and mutation bridge.
- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots and durable change logs.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): JSON Schema validation, Frontier profile generation, CloudEvent envelopes, and query/table schema helpers.
- [`@shapeshift-labs/frontier-migrations`](https://www.npmjs.com/package/@shapeshift-labs/frontier-migrations): Boundary-first data migrations, import normalization, plugin/API version mapping, versioned envelopes, graph diagnostics, patch path rewrites, dry-run reports, and current-shape rehydration.
- [`@shapeshift-labs/frontier-inspect`](https://www.npmjs.com/package/@shapeshift-labs/frontier-inspect): Cross-package inspection/evidence bundles, registry graph snapshots, feature/resource impact reports, timeline/event normalization, redaction, JSONL import/export, and AI-readable app feature maps.
- [`@shapeshift-labs/frontier-scheduler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scheduler): Deterministic work scheduling, lanes, cancellation, backpressure, frame policies, replay snapshots, and work graphs.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): Opt-in structured logging, browser telemetry, scheduled sinks, file sinks, exporters, benchmark traces, and Frontier patch/update summaries.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): Explicit mutation and selector plans compiled to Frontier patches or CRDT operations.
- [`@shapeshift-labs/frontier-effects`](https://www.npmjs.com/package/@shapeshift-labs/frontier-effects): Serializable effect descriptors and resource graphs for Frontier apps, including fetch, storage, timers, navigation, workers, clipboard, broadcast, WebSocket, stream, policy metadata, runtime records, redaction, JSONL, proof helpers, and registry graph output.
- [`@shapeshift-labs/frontier-auth`](https://www.npmjs.com/package/@shapeshift-labs/frontier-auth): Frontier-native auth contracts for providers, sessions, profile completeness, route and resource gates, account-linking policy, token issue/verify plans, runtime grants, audit events, registry graphs, lint resources, and auth evidence without owning app secrets, crypto, storage, or provider SDKs.
- [`@shapeshift-labs/frontier-policy`](https://www.npmjs.com/package/@shapeshift-labs/frontier-policy): Serializable policy and capability decisions for Frontier apps, effects, views, sync, routes, traces, and AI tools.
- [`@shapeshift-labs/frontier-flags`](https://www.npmjs.com/package/@shapeshift-labs/frontier-flags): Patchable policy-aware feature flag state for Frontier apps, including targeting, deterministic rollouts, experiment variants, kill switches, exposure records, audit logs, and replay evidence.
- [`@shapeshift-labs/frontier-tools`](https://www.npmjs.com/package/@shapeshift-labs/frontier-tools): Serializable app action/tool manifests for AI-operable Frontier apps, including availability, validation, dry-run plans, patch previews, effect/tool constraints, execution records, rollback links, and registry graph output.
- [`@shapeshift-labs/frontier-sandbox`](https://www.npmjs.com/package/@shapeshift-labs/frontier-sandbox): Runtime-agnostic sandbox contracts for Frontier patch-producing actions, including manifests, declared reads/writes/capabilities, host-validated patch/effect/event/log results, dynamic source modules, source event replay, and structural runtime adapters.
- [`@shapeshift-labs/frontier-sandbox-quickjs`](https://www.npmjs.com/package/@shapeshift-labs/frontier-sandbox-quickjs): QuickJS/WebAssembly runtime adapter for Frontier sandbox actions, including invocation/runtime isolation modes, deadline and memory limits, dynamic source execution, and patch/effect result normalization.
- [`@shapeshift-labs/frontier-workflow`](https://www.npmjs.com/package/@shapeshift-labs/frontier-workflow): Serializable durable workflow/process manifests for Frontier apps, including steps, waits, approvals, timers, retries, expected patches, compensation, records, timelines, and registry graph output.
- [`@shapeshift-labs/frontier-worker`](https://www.npmjs.com/package/@shapeshift-labs/frontier-worker): Serializable worker and edge task descriptors for Frontier apps, including queues, idempotency keys, retry and timeout policy, declared reads/writes/effects, snapshots, patch outputs, produced assets, execution records, logs, trace links, proof hashes, dedupe indexes, and registry graph output.
- [`@shapeshift-labs/frontier-queue`](https://www.npmjs.com/package/@shapeshift-labs/frontier-queue): Serializable durable queue state, leases, retries, dedupe keys, patch-carrying jobs, dead-letter records, replay evidence, and queue inspection for Frontier apps.
- [`@shapeshift-labs/frontier-swarm`](https://www.npmjs.com/package/@shapeshift-labs/frontier-swarm): Hierarchical swarm plans, lanes, compute profiles, ownership policy, semantic ownership regions, task queues, event streams, run records, merge bundles, merge indexes, queue overlays, merge admission, coordinator dashboards, changed-path checks, and proof artifacts for Frontier agent work.
- [`@shapeshift-labs/frontier-swarm-codex`](https://www.npmjs.com/package/@shapeshift-labs/frontier-swarm-codex): Node Codex CLI adapter for Frontier swarm plans, including prompt rendering, worktree and snapshot workspaces, Codex argument compatibility, browser resource allocation, JSONL capture, verification commands, pid-backed stop, collect/apply workflows, merge indexes, queue overlays, merge bundles, normalized job evidence, coordinator query artifacts, and result artifacts.
- [`@shapeshift-labs/frontier-lang-kernel`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-kernel): Runtime-neutral semantic source graph, type/lattice/extern declarations, patch bundles, replay, hashing, evidence records, and merge-admission kernel for Frontier Lang.
- [`@shapeshift-labs/frontier-lang-parser`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-parser): Dependency-light Frontier Lang parser for modules, entities, state, actions, effects, types, externs, targets, and lattice declarations.
- [`@shapeshift-labs/frontier-lang-checker`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-checker): Checker and diagnostics for Frontier Lang semantic documents, including type symbols, effects, regions, lattice laws, CRDT metadata, and patch evidence.
- [`@shapeshift-labs/frontier-lang-typescript`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-typescript): TypeScript projection adapter for Frontier Lang semantic documents, including type/entity/state/action/extern declarations and CRDT lattice descriptors.
- [`@shapeshift-labs/frontier-lang-javascript`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-javascript): JavaScript projection adapter for Frontier Lang semantic documents, including ESM action stubs and schema/lattice descriptors.
- [`@shapeshift-labs/frontier-lang-rust`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-rust): Rust projection adapter for Frontier Lang semantic documents, including structs, aliases, and action stubs.
- [`@shapeshift-labs/frontier-lang-python`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-python): Python projection adapter for Frontier Lang semantic documents, including dataclasses, typed patch records, and action stubs.
- [`@shapeshift-labs/frontier-lang-c`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-c): C header projection adapter for Frontier Lang semantic documents, including structs and action prototypes.
- [`@shapeshift-labs/frontier-lang-compiler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-compiler): Compiler facade for Frontier Lang source documents, including parse, check, hash, diagnostics, universal AST envelopes, proof/paradigm semantic summaries, projection to TypeScript, JavaScript, Rust, Python, and C, and native source-import adapters for semantic merge evidence.
- [`@shapeshift-labs/frontier-lang-swift`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-swift): Swift source-language importer package for Frontier Lang semantic documents, including package-level metadata, SwiftSyntax adapter helpers, native import results, and semantic sidecar generation for SwiftSyntax/SwiftParser-shaped syntax trees.
- [`@shapeshift-labs/frontier-lang-kotlin`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-kotlin): Kotlin PSI source-language importer package for Frontier Lang semantic documents, including package-level metadata, Kotlin PSI adapter helpers, native import results, and semantic sidecar generation for Kotlin PSI/KtFile-shaped syntax trees.
- [`@shapeshift-labs/frontier-lang-java`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-java): Java source-language importer package for Frontier Lang semantic documents, including package-level metadata, Java AST adapter helpers, native import results, and semantic sidecar generation for javac/JDT/JavaParser-shaped ASTs.
- [`@shapeshift-labs/frontier-lang-go`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-go): Go source-language importer package for Frontier Lang semantic documents, including package-level metadata, Go AST adapter helpers, native import results, and semantic sidecar generation for go/ast File or Package trees.
- [`@shapeshift-labs/frontier-lang-csharp`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-csharp): C# Roslyn source-language importer package for Frontier Lang semantic documents, including package-level metadata, Roslyn adapter helpers, native import results, and semantic sidecar generation for SyntaxTree/SyntaxNode-shaped ASTs.
- [`@shapeshift-labs/frontier-lang-clang`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-clang): Clang AST source-language importer package for Frontier Lang semantic documents, including package-level metadata, Clang AST JSON adapter helpers, native import results, and semantic sidecar generation for C/C++ translation units.
- [`@shapeshift-labs/frontier-lang-cli`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-cli): Command line interface for parsing, checking, hashing, emitting, native source import/projection, semantic slicing, and corpus roundtrip evidence for Frontier Lang projects.
- [`@shapeshift-labs/frontier-lang`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang): Umbrella package for Frontier Lang kernel, parser, checker, compiler facade, universal AST helpers, projection adapters, and source-language importer adapters.
- [`@shapeshift-labs/frontier-kv`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv): Serializable in-memory key/value state for Frontier apps, including TTL, versioned compare-and-set, batched patch mutations, scans, watchers, snapshots, JSONL event evidence, and replay verification.
- [`@shapeshift-labs/frontier-kv-locks`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-locks): Lease-style lock records on top of Frontier KV, including acquire, renew, release, fencing tokens, expiration, owner evidence, and replayable lock events.
- [`@shapeshift-labs/frontier-kv-rate-limit`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-rate-limit): Patch-native rate limit buckets for Frontier KV, including fixed windows, sliding windows, token buckets, deterministic refill, consume evidence, and reset records.
- [`@shapeshift-labs/frontier-kv-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-file): Node file persistence adapter for Frontier KV snapshots and append-only JSONL event logs, including atomic writes, compaction, replay loading, and adapter evidence.
- [`@shapeshift-labs/frontier-kv-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-idb): IndexedDB persistence adapter for Frontier KV snapshots and event logs, with structural IDB interfaces, upgrade planning, compact event storage, and replay loading.
- [`@shapeshift-labs/frontier-kv-redis`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-redis): Redis-compatible command planning and structural client adapter for Frontier KV operations, including key mapping, TTL commands, optimistic CAS scripts, and replay evidence without bundling Redis drivers.
- [`@shapeshift-labs/frontier-kv-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-server): Small Node HTTP server adapter for Frontier KV, including request planning, JSON endpoints for get/set/delete/scan/batch, optional rate-limit hooks, and replayable response evidence.
- [`@shapeshift-labs/frontier-assets`](https://www.npmjs.com/package/@shapeshift-labs/frontier-assets): Serializable asset and content provenance graphs for Frontier apps, including source files, generated variants, thumbnails, LOD chunks, shader/material dependencies, transforms, hashes, owners, runtime consumers, review plans, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-blueprint`](https://www.npmjs.com/package/@shapeshift-labs/frontier-blueprint): Serializable Blueprint/Prefab flyweight templates for Frontier apps, including parameterized instantiation, deterministic ID/path remapping, compact overrides, variants, effective-state materialization, scene/state patch emission, dependency metadata, and registry graph output.
- [`@shapeshift-labs/frontier-triggers`](https://www.npmjs.com/package/@shapeshift-labs/frontier-triggers): Capability-gated event trigger registry, scoped event envelopes, listener/reaction rules, structured rejection, deterministic event-to-action scheduling, replay/provenance records, and registry graph output.
- [`@shapeshift-labs/frontier-virtual`](https://www.npmjs.com/package/@shapeshift-labs/frontier-virtual): DOM-neutral virtualization, layout providers, range materialization, grids, spatial/frustum indexes, patch invalidation, camera anchors, and serializable layout state.
- [`@shapeshift-labs/frontier-table`](https://www.npmjs.com/package/@shapeshift-labs/frontier-table): Renderer-neutral data grid and table primitives for Frontier apps, including stable row identity, sorting, filtering, selection, virtual ranges, patch-driven edits, cache/dataflow descriptors, and CRDT-compatible row and cell operation frames.
- [`@shapeshift-labs/frontier-scene`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scene): Patch-native 2D/3D scene graph, transform propagation, bounds queries, virtual/culling adapters, spatial invalidation, and camera/frustum materialization.
- [`@shapeshift-labs/frontier-pathfinding`](https://www.npmjs.com/package/@shapeshift-labs/frontier-pathfinding): Patch-native grid pathfinding, typed-array A*/Dijkstra search, flow fields, connected components, line-of-sight smoothing, dirty-cell invalidation, and scheduler-friendly path jobs.
- [`@shapeshift-labs/frontier-lod`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lod): Patch-native level-of-detail and significance selection for rendering and computation workloads, compact typed hot paths, multi-observer selection, budget degradation, materialization frames, and scheduler work plans.
- [`@shapeshift-labs/frontier-route`](https://www.npmjs.com/package/@shapeshift-labs/frontier-route): DOM-neutral app/game route resources, route and scene manifests, match/resolve/transition planning, dependency metadata, sessions, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-trace`](https://www.npmjs.com/package/@shapeshift-labs/frontier-trace): Serializable traces, spans, events, causal links, W3C trace context helpers, timeline/resource/path queries, critical-path analysis, registry graph output, JSONL/proof helpers, Chrome trace export, and redaction for app-wide feature observability.
- [`@shapeshift-labs/frontier-manifest`](https://www.npmjs.com/package/@shapeshift-labs/frontier-manifest): Build/static feature manifests for owners, routes, actions, states, migrations, tests, source files, assets, resources, tasks, dependency metadata, registry graph output, feature maps, JSONL export, and impact queries.
- [`@shapeshift-labs/frontier-view`](https://www.npmjs.com/package/@shapeshift-labs/frontier-view): Renderer-neutral view manifests, type defaults, validation frames, action bindings, visual channels, virtual/LOD hints, and data-to-representation mapping for Frontier apps.
- [`@shapeshift-labs/frontier-icons`](https://www.npmjs.com/package/@shapeshift-labs/frontier-icons): Renderer-neutral icon records, icon sets, lookup aliases, SVG frames, string rendering, and registry evidence for Frontier apps.
- [`@shapeshift-labs/frontier-design`](https://www.npmjs.com/package/@shapeshift-labs/frontier-design): Renderer-neutral design-system tokens, semantic roles, recipes, target style frames, CSS variable output, and registry graph evidence for Frontier apps.
- [`@shapeshift-labs/frontier-canvas`](https://www.npmjs.com/package/@shapeshift-labs/frontier-canvas): Renderer-neutral infinite canvas surfaces for Frontier apps, including camera and viewport math, pan/zoom plans, grid materialization, snapping, hit testing, selection handles, extensible tool dispatch, frame records, registry graph output, and impact/proof helpers.
- [`@shapeshift-labs/frontier-canvas-tools`](https://www.npmjs.com/package/@shapeshift-labs/frontier-canvas-tools): Renderer-neutral editor tools, state machines, transform handles, permissions, async records, and AI action bridges for Frontier canvas surfaces.
- [`@shapeshift-labs/frontier-dnd`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dnd): Renderer-neutral drag-and-drop sessions, sensor descriptors, collision ranking, drop planning, reorder patches, state partitioning, and registry evidence for Frontier apps.
- [`@shapeshift-labs/frontier-dom`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dom): Patch-native DOM and host renderer bindings, manifest hydration, JSX runtime/compiler helpers, SSR, devtools, and logging bridges.
- [`@shapeshift-labs/frontier-playwright`](https://www.npmjs.com/package/@shapeshift-labs/frontier-playwright): Playwright/headless automation probes for Frontier state, DOM, devtools, marks, and timeline queries.
- [`@shapeshift-labs/frontier-test`](https://www.npmjs.com/package/@shapeshift-labs/frontier-test): Serializable test/spec evidence manifests for Frontier apps, including fixtures, commands, expected patches/effects/routes/policies, coverage declarations, run plans, run records, report adapters, replay proofs, fuzzers, benchmarks, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-fixtures`](https://www.npmjs.com/package/@shapeshift-labs/frontier-fixtures): Deterministic fixture and scenario generation for Frontier apps, including schema-valid sample state, related entity collections, actor personas, route states, replay-verified patch streams, event records, JSONL bundles, and evidence summaries.
- [`@shapeshift-labs/frontier-component-preview`](https://www.npmjs.com/package/@shapeshift-labs/frontier-component-preview): Frontier-native component preview books, generated preview manifests, stateful variants, Vite virtual modules, standalone browser preview shells, inspector bridges, and preview harness evidence for Frontier apps.
- [`@shapeshift-labs/frontier-documentation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-documentation): Frontier-native documentation manifests, generated documentation books, package/API/source discovery, Vite virtual modules, standalone browser docs shells, inspector bridges, search indexes, and documentation harness evidence for Frontier apps and packages.
- [`@shapeshift-labs/frontier-ast-walk`](https://www.npmjs.com/package/@shapeshift-labs/frontier-ast-walk): Dependency-light source graph, import/export/declaration/call analysis, Frontier package-use discovery, and business-logic placement findings for Frontier tools, apps, docs, fuzzers, benchmarks, and agent evidence.
- [`@shapeshift-labs/frontier-history`](https://www.npmjs.com/package/@shapeshift-labs/frontier-history): Serializable temporal explanation and causality records for Frontier apps, including field-change explanations, action/workflow/policy/effect/trace/test provenance, audit windows, undo planning, registry/provenance graph output, JSONL replay bundles, and proof hashes.
- [`@shapeshift-labs/frontier-application`](https://www.npmjs.com/package/@shapeshift-labs/frontier-application): Serializable whole-application graph and impact queries for Frontier apps, including features, owners, packages, routes, views, actions, mutations, state paths, effects, workers, assets, tests, traces, policies, workflows, migrations, benchmarks, registry graph output, feature maps, JSONL bundles, and proof hashes.
- [`@shapeshift-labs/frontier-linter`](https://www.npmjs.com/package/@shapeshift-labs/frontier-linter): Serializable Frontier lint rules, diagnostics, fixes, reports, and fast rule execution for package catalogs, registry graphs, application maps, manifests, traces, policies, workflows, workers, assets, tests, benchmarks, and source snippets.
- [`@shapeshift-labs/frontier-framework`](https://www.npmjs.com/package/@shapeshift-labs/frontier-framework): High-level app framework package for Frontier applications, including configuration, CLI scaffolding, Vite builds, monorepo layout, TSX route builds, split frontend/backend deploy artifacts, backend-neutral Fetch handler and sync transport contracts, runtime data-source migrations, devtools, harness gates, agent MCP/tool manifests, CI evidence gates, workflow manifests, SARIF/linter output, replay scripts, and evidence manifest output.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): Native CRDT documents, update tooling, awareness, branches, conflict introspection, version frames, and undo.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): CRDT sync endpoints, repo/storage/provider contracts, scheduled sync work, document URLs, local networks, model checking, forensics, and text binding contracts.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket client/server transports for Frontier CRDT sync providers.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store hooks and adapters for Frontier state, cache, and CRDT surfaces.
- [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext): Rich text Delta normalization/application, marks, embeds, ranges, and cursor/selection transforms for local editor integrations.
- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): Shared realtime command, tick, snapshot, prediction, reconciliation, interpolation, rollback, message, and delta primitives.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): Authoritative realtime room, tick, command validation, rate-limit, session, and snapshot-history runtime.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket client, wire, and Node room-server transport for Frontier realtime.
- [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game): Game-facing entity, component, player, room, ownership, spatial interest, rollback, physics, and replication helpers above realtime.
- [`@shapeshift-labs/loom`](https://www.npmjs.com/package/@shapeshift-labs/loom): Repo-level semantic collaboration CLI for .loom workspaces, including init, scan, status, graph snapshots, projection plans, Frontier Lang delegation, Frontier Swarm delegation, and Frontier Framework delegation.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-dataflow`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dataflow)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-migrations`](https://github.com/siliconjungle/-shapeshift-labs-frontier-migrations)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- [`siliconjungle/-shapeshift-labs-frontier-inspect`](https://github.com/siliconjungle/-shapeshift-labs-frontier-inspect)
- [`siliconjungle/-shapeshift-labs-frontier-scheduler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scheduler)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-effects`](https://github.com/siliconjungle/-shapeshift-labs-frontier-effects)
- [`siliconjungle/-shapeshift-labs-frontier-auth`](https://github.com/siliconjungle/-shapeshift-labs-frontier-auth)
- [`siliconjungle/-shapeshift-labs-frontier-policy`](https://github.com/siliconjungle/-shapeshift-labs-frontier-policy)
- [`siliconjungle/-shapeshift-labs-frontier-flags`](https://github.com/siliconjungle/-shapeshift-labs-frontier-flags)
- [`siliconjungle/-shapeshift-labs-frontier-tools`](https://github.com/siliconjungle/-shapeshift-labs-frontier-tools)
- [`siliconjungle/-shapeshift-labs-frontier-sandbox`](https://github.com/siliconjungle/-shapeshift-labs-frontier-sandbox)
- [`siliconjungle/-shapeshift-labs-frontier-sandbox-quickjs`](https://github.com/siliconjungle/-shapeshift-labs-frontier-sandbox-quickjs)
- [`siliconjungle/-shapeshift-labs-frontier-workflow`](https://github.com/siliconjungle/-shapeshift-labs-frontier-workflow)
- [`siliconjungle/-shapeshift-labs-frontier-worker`](https://github.com/siliconjungle/-shapeshift-labs-frontier-worker)
- [`siliconjungle/-shapeshift-labs-frontier-queue`](https://github.com/siliconjungle/-shapeshift-labs-frontier-queue)
- [`siliconjungle/-shapeshift-labs-frontier-swarm`](https://github.com/siliconjungle/-shapeshift-labs-frontier-swarm)
- [`siliconjungle/-shapeshift-labs-frontier-swarm-codex`](https://github.com/siliconjungle/-shapeshift-labs-frontier-swarm-codex)
- [`siliconjungle/-shapeshift-labs-frontier-lang-kernel`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-kernel)
- [`siliconjungle/-shapeshift-labs-frontier-lang-parser`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-parser)
- [`siliconjungle/-shapeshift-labs-frontier-lang-checker`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-checker)
- [`siliconjungle/-shapeshift-labs-frontier-lang-typescript`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-typescript)
- [`siliconjungle/-shapeshift-labs-frontier-lang-javascript`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-javascript)
- [`siliconjungle/-shapeshift-labs-frontier-lang-rust`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-rust)
- [`siliconjungle/-shapeshift-labs-frontier-lang-python`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-python)
- [`siliconjungle/-shapeshift-labs-frontier-lang-c`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-c)
- [`siliconjungle/-shapeshift-labs-frontier-lang-compiler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-compiler)
- [`siliconjungle/-shapeshift-labs-frontier-lang-swift`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-swift)
- [`siliconjungle/-shapeshift-labs-frontier-lang-kotlin`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-kotlin)
- [`siliconjungle/-shapeshift-labs-frontier-lang-java`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-java)
- [`siliconjungle/-shapeshift-labs-frontier-lang-go`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-go)
- [`siliconjungle/-shapeshift-labs-frontier-lang-csharp`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-csharp)
- [`siliconjungle/-shapeshift-labs-frontier-lang-clang`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-clang)
- [`siliconjungle/-shapeshift-labs-frontier-lang-cli`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-cli)
- [`siliconjungle/-shapeshift-labs-frontier-lang`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang)
- [`siliconjungle/-shapeshift-labs-frontier-kv`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv)
- [`siliconjungle/-shapeshift-labs-frontier-kv-locks`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-locks)
- [`siliconjungle/-shapeshift-labs-frontier-kv-rate-limit`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-rate-limit)
- [`siliconjungle/-shapeshift-labs-frontier-kv-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-file)
- [`siliconjungle/-shapeshift-labs-frontier-kv-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-idb)
- [`siliconjungle/-shapeshift-labs-frontier-kv-redis`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-redis)
- [`siliconjungle/-shapeshift-labs-frontier-kv-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-server)
- [`siliconjungle/-shapeshift-labs-frontier-assets`](https://github.com/siliconjungle/-shapeshift-labs-frontier-assets)
- [`siliconjungle/-shapeshift-labs-frontier-blueprint`](https://github.com/siliconjungle/-shapeshift-labs-frontier-blueprint)
- [`siliconjungle/-shapeshift-labs-frontier-triggers`](https://github.com/siliconjungle/-shapeshift-labs-frontier-triggers)
- [`siliconjungle/-shapeshift-labs-frontier-virtual`](https://github.com/siliconjungle/-shapeshift-labs-frontier-virtual)
- [`siliconjungle/-shapeshift-labs-frontier-table`](https://github.com/siliconjungle/-shapeshift-labs-frontier-table)
- [`siliconjungle/-shapeshift-labs-frontier-scene`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scene)
- [`siliconjungle/-shapeshift-labs-frontier-pathfinding`](https://github.com/siliconjungle/-shapeshift-labs-frontier-pathfinding)
- [`siliconjungle/-shapeshift-labs-frontier-lod`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lod)
- [`siliconjungle/-shapeshift-labs-frontier-route`](https://github.com/siliconjungle/-shapeshift-labs-frontier-route)
- [`siliconjungle/-shapeshift-labs-frontier-trace`](https://github.com/siliconjungle/-shapeshift-labs-frontier-trace)
- [`siliconjungle/-shapeshift-labs-frontier-manifest`](https://github.com/siliconjungle/-shapeshift-labs-frontier-manifest)
- [`siliconjungle/-shapeshift-labs-frontier-view`](https://github.com/siliconjungle/-shapeshift-labs-frontier-view)
- [`siliconjungle/-shapeshift-labs-frontier-icons`](https://github.com/siliconjungle/-shapeshift-labs-frontier-icons)
- [`siliconjungle/-shapeshift-labs-frontier-design`](https://github.com/siliconjungle/-shapeshift-labs-frontier-design)
- [`siliconjungle/-shapeshift-labs-frontier-canvas`](https://github.com/siliconjungle/-shapeshift-labs-frontier-canvas)
- [`siliconjungle/-shapeshift-labs-frontier-canvas-tools`](https://github.com/siliconjungle/-shapeshift-labs-frontier-canvas-tools)
- [`siliconjungle/-shapeshift-labs-frontier-dnd`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dnd)
- [`siliconjungle/-shapeshift-labs-frontier-dom`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dom)
- [`siliconjungle/-shapeshift-labs-frontier-playwright`](https://github.com/siliconjungle/-shapeshift-labs-frontier-playwright)
- [`siliconjungle/-shapeshift-labs-frontier-test`](https://github.com/siliconjungle/-shapeshift-labs-frontier-test)
- [`siliconjungle/-shapeshift-labs-frontier-fixtures`](https://github.com/siliconjungle/-shapeshift-labs-frontier-fixtures)
- [`siliconjungle/-shapeshift-labs-frontier-component-preview`](https://github.com/siliconjungle/-shapeshift-labs-frontier-component-preview)
- [`siliconjungle/-shapeshift-labs-frontier-documentation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-documentation)
- [`siliconjungle/-shapeshift-labs-frontier-ast-walk`](https://github.com/siliconjungle/-shapeshift-labs-frontier-ast-walk)
- [`siliconjungle/-shapeshift-labs-frontier-history`](https://github.com/siliconjungle/-shapeshift-labs-frontier-history)
- [`siliconjungle/-shapeshift-labs-frontier-application`](https://github.com/siliconjungle/-shapeshift-labs-frontier-application)
- [`siliconjungle/-shapeshift-labs-frontier-linter`](https://github.com/siliconjungle/-shapeshift-labs-frontier-linter)
- [`siliconjungle/-shapeshift-labs-frontier-framework`](https://github.com/siliconjungle/-shapeshift-labs-frontier-framework)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- [`siliconjungle/-shapeshift-labs-frontier-realtime`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-server)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)
- [`siliconjungle/-shapeshift-labs-loom`](https://github.com/siliconjungle/-shapeshift-labs-loom)

## Install

```sh
npm install @shapeshift-labs/frontier @shapeshift-labs/frontier-event-log
```

## Usage

```ts
import { diff } from '@shapeshift-labs/frontier';
import { appendPatchEvent, createEventLog } from '@shapeshift-labs/frontier-event-log';

const log = createEventLog({
  capacity: 1000,
  compactByKey: true,
  dropTombstones: true
});

log.append({
  key: 'todo:a',
  value: { type: 'todo.updated', id: 'a', done: true }
});

const patch = diff(
  { todos: [{ id: 'a', done: false }] },
  { todos: [{ id: 'a', done: true }] },
  { arrayKey: 'id' }
);

appendPatchEvent(log, patch, {
  key: 'todos',
  metadata: { source: 'cache-write' }
});

const replay = log.read(0, { limit: 32 });
console.log(replay.records, replay.cursor);
```

## API

```ts
import {
  applyPatchEventRecord,
  appendAutonomousDecisionAppliedEvent,
  appendAutonomousDecisionCommittedEvent,
  appendAutonomousDecisionConflictBlockedEvent,
  appendAutonomousDecisionHumanBlockedEvent,
  appendAutonomousDecisionNoChangeEvent,
  appendAutonomousDecisionRejectedEvent,
  appendAutonomousDecisionRerunEvent,
  appendAutonomousDecisionSupersededEvent,
  appendCoordinatorGateFailedEvent,
  appendCoordinatorGatePassedEvent,
  appendCoordinatorGateSelectedEvent,
  appendCoordinatorGateSkippedEvent,
  appendCoordinatorGateStartedEvent,
  appendPatchEvent,
  appendBundleExpectedEvent,
  appendBundleWrittenEvent,
  appendPatchGeneratedEvent,
  appendPatchMissingEvent,
  appendNoChangeEvidenceEvent,
  appendCollectorSynthesizedEvent,
  appendBundleRejectedEvent,
  appendContinuousPoolStartedEvent,
  appendContinuousPoolWorkerScheduledEvent,
  appendContinuousPoolWorkerStartedEvent,
  appendContinuousPoolWorkerHeartbeatEvent,
  appendContinuousPoolWorkerLeasedEvent,
  appendContinuousPoolWorkerFinishedEvent,
  appendContinuousPoolWorkerFailedEvent,
  appendContinuousPoolWorkerDrainedEvent,
  appendContinuousPoolBundleCollectedEvent,
  appendContinuousPoolDecisionWrittenEvent,
  appendContinuousPoolPatchAppliedEvent,
  appendContinuousPoolQueueRefilledEvent,
  appendContinuousPoolHumanBlockedEvent,
  appendContinuousPoolDrainedEvent,
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
  replayAutonomousDecisionRecords,
  summarizeAutonomousDecisionReplay,
  createEventLogCheckpoint,
  createEventLog,
  createEventLogReplayStorage,
  diffBetweenTimes,
  filterModelRoutingFeedbackEvents,
  filterSemanticChangeStreamEvents,
  replayEventLog,
  replaySemanticChangeStreamEvents,
  stateAtTime,
  summarizeAgentReplay,
  type AgentReplaySummary,
  type AgentReplaySummaryClassifier,
  type AutonomousDecisionReplayRecordFields,
  type AutonomousDecisionReplayRecordValue,
  type AutonomousDecisionReplaySummary,
  type CoordinatorGateEventFields,
  type CoordinatorGateEventKind,
  type CoordinatorGateEventStatus,
  type CoordinatorGateEventValue,
  type EventLog,
  type EventLogCheckpoint,
  type EventLogConsumer,
  type EventLogCursor,
  type EventLogRecord,
  type EventLogReplayStorage,
  type BundleSynthesisDecision,
  type BundleSynthesisEventFields,
  type BundleSynthesisEventKind,
  type BundleSynthesisEventValue,
  type ContinuousPoolLifecycleEventFields,
  type ContinuousPoolLifecycleEventKind,
  type ContinuousPoolLifecycleEventValue,
  type SemanticChangeStreamEventFields,
  type SemanticChangeStreamEventFilterOptions,
  type SemanticChangeStreamEventKind,
  type SemanticChangeStreamEventValue,
  type SemanticChangeStreamReplayOptions,
  type PatchEventLogValue
} from '@shapeshift-labs/frontier-event-log';
```

### `createEventLog(options?)`

Creates an in-memory log with monotonically increasing offsets.

Useful options:

- `capacity`: maximum retained record count.
- `discard`: `oldest` drops old records when full; `new` rejects new appends.
- `compactByKey`: enables key-based compaction.
- `compactOnAppend`: compacts after each append when `compactByKey` is enabled.
- `dropTombstones`: removes latest `null` keyed records during compaction.
- `scheduler`: optional structural scheduler for queued append compaction.
- `initialOffset`: starting offset.
- `now`: timestamp supplier for deterministic tests.

### Appending And Reading

- `log.append(input)` appends or throws if rejected.
- `log.tryAppend(input)` returns `{ accepted, record?, reason? }`.
- `log.appendBatch(inputs, { maxRecords?, maxBytes? })` appends a bounded batch.
- `log.read(cursor?, { limit?, maxBytes? })` returns cloned records plus a cursor.
- `log.truncateBefore(cursor)` drops retained records before a checkpoint cursor.
- `log.clear()` removes retained records without resetting the next offset.

### Consumers

```ts
const consumer = log.createConsumer('worker-a');
const result = consumer.read({ limit: 100 });
consumer.ack(result.cursor);
```

Consumers own a read cursor and a committed cursor. They are useful for replay windows, durable checkpoints, and independent application workers.

### Checkpoints And Replay

```ts
const checkpoint = createEventLogCheckpoint(log, { count: 2 });
const result = replayEventLog(log, checkpoint, (state, record) => ({
  count: state.count + Number(record.value.delta || 0)
}));
```

`createEventLogCheckpoint()` captures an application snapshot plus an event-log cursor. `replayEventLog()` resumes from that cursor in bounded batches and returns the replayed state, cursor, replay count, and a fresh checkpoint. `createEventLogReplayStorage()` provides the same snapshot-plus-bounded-change-log shape used by state-cache persistence without making state-cache depend on event-log.

### Agent/Swarm Replay Summary

```ts
const summary = summarizeAgentReplay(log, { batchSize: 512 });

console.log(summary.started, summary.finished, summary.failed);
console.log(summary.question, summary.decision, summary.applied);
```

`summarizeAgentReplay()` reads a lifetime log in bounded batches and returns counts for agent/swarm lifecycle and merge-review events: `started`, `finished`, `failed`, `question`, `decision`, and `applied`. The default classifier scans common string fields such as `type`, `kind`, `event`, `status`, and `outcome`, so records like `agent.started`, `human.question`, `swarm.decision`, and `merge.applied` can feed a coordinator dashboard without importing swarm runtime packages.

The summary also includes `records`, `matchedRecords`, `cursor`, `firstOffset`, `nextOffset`, `highWatermark`, and `truncated` so dashboards can show whether retained history was complete. Pass `strict: true` to fail on truncation, or pass `classify(record)` when a run uses a different event schema.

### Question Lifecycle Replay

```ts
const log = createEventLog();

appendQuestionAskedEvent(log, {
  questionCode: 'question:alpha',
  taskId: 'task:alpha',
  jobId: 'job:alpha'
});

appendQuestionAnsweredEvent(log, {
  questionCode: 'question:alpha',
  taskId: 'task:alpha',
  jobId: 'job:alpha',
  answerText: 'use the parent continuation',
  continuationTarget: 'continue:parent'
});

appendQuestionConsumedEvent(log, {
  questionCode: 'question:alpha',
  taskId: 'task:alpha',
  jobId: 'job:alpha',
  answerText: 'use the parent continuation',
  continuationTarget: 'continue:parent'
});

const questionSummary = summarizeQuestionLifecycleReplay(log);

console.log(questionSummary.questionCount);
console.log(questionSummary.byQuestionId['question:alpha']?.status);
console.log(questionSummary.answeredQuestions.length);
```

`appendQuestionAskedEvent()` is a convenience alias for `appendQuestionOpenedEvent()`, and the append helpers write `question.opened`, `question.answered`, and `question.consumed` records with stable `questionId`/`eventId` defaults when you omit them. `summarizeQuestionLifecycleReplay()` groups those events by question identity, preserves aliases such as `questionCode`, `taskId`, and `jobId`, and separates `openedQuestions`, `answeredQuestions`, and `consumedQuestions` so dashboards and continuation routing can render the current lifecycle without a second projection layer. Questions remain available in `latestAnsweredByQuestionId` and `latestConsumedByQuestionId` once they have reached those stages, even after later routing updates.

### Autonomous Decision Replay

```ts
const log = createEventLog();

appendAutonomousDecisionAppliedEvent(log, {
  queueSubject: 'queue:alpha',
  queueSubjectAliases: ['job:alpha'],
  changedPaths: ['packages/frontier-event-log/src/event-log.ts'],
  verificationSummary: { passed: true, checks: 12 },
  sourceRun: 'run:source-1',
  decisionReason: 'tests passed'
}, { timestamp: 10 });

appendAutonomousDecisionConflictBlockedEvent(log, {
  queueSubject: 'queue:beta',
  changedPaths: ['packages/frontier-event-log/src/index.ts'],
  verificationSummary: { passed: false, blocked: 'merge conflict' },
  sourceRun: 'run:source-2',
  decisionReason: 'conflict must be resolved first'
}, { timestamp: 20 });

const replay = summarizeAutonomousDecisionReplay(log);

console.log(replay.byQueueSubject['queue:alpha']?.terminalStatus);
console.log(replay.latestOpenByQueueSubject['queue:beta']?.status);

const ordered = replayAutonomousDecisionRecords(
  log,
  createEventLogCheckpoint(log, [], { cursor: 0 }),
  (state, record) => state.concat(record.value.kind)
);

console.log(ordered.state);
```

`appendAutonomousDecisionAppliedEvent()`, `appendAutonomousDecisionCommittedEvent()`, `appendAutonomousDecisionRejectedEvent()`, `appendAutonomousDecisionRerunEvent()`, `appendAutonomousDecisionNoChangeEvent()`, `appendAutonomousDecisionSupersededEvent()`, `appendAutonomousDecisionConflictBlockedEvent()`, and `appendAutonomousDecisionHumanBlockedEvent()` write a shared replay schema for autonomous decisions. Each emitted record gets a stable `value.id` by default, and you can still supply `options.key` when a keyed record is useful. Each record can carry `queueSubject` and aliases for dashboard grouping plus `changedPaths`, `verificationSummary`, `sourceRun`, and `decisionReason`.

`summarizeAutonomousDecisionReplay()` collapses decision records by queue subject aliases and keeps the latest collapsed state for each subject. The default resolver looks for common subject fields such as `queueSubject`, `queueSubjectAlias`, `queueSubjectAliases`, `queueSubjects`, `queueKeys`, `queueItemIds`, `jobId`, `taskId`, `key`, and `alias`, then merges any overlapping aliases into one subject summary.

Terminal `applied`, `committed`, `rejected`, and `superseded` records remain in `latestTerminalByQueueSubject`, while `rerun`, `conflict-blocked`, and `human-blocked` records stay visible in `latestOpenByQueueSubject` until a terminal record supersedes them. `replayAutonomousDecisionRecords()` replays the matching records in timestamp order before applying the reducer. The returned summary also exposes `byAlias` for direct alias lookup.

### Coordinator Gate Lifecycle

```ts
const log = createEventLog();

appendCoordinatorGateSelectedEvent(log, {
  gateName: 'coordinator-root-test',
  jobId: 'job:alpha',
  taskId: 'task:alpha',
  queueSubject: 'queue:alpha',
  queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
  queueKey: 'queue:alpha',
  run: 'run:auto-drain',
  lane: 'lane:coordinator'
});

appendCoordinatorGateStartedEvent(log, {
  gateName: 'coordinator-root-test',
  jobId: 'job:alpha',
  taskId: 'task:alpha',
  queueSubject: 'queue:alpha',
  queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
  queueKey: 'queue:alpha',
  run: 'run:auto-drain',
  lane: 'lane:coordinator'
});

appendCoordinatorGatePassedEvent(log, {
  gateName: 'coordinator-root-test',
  jobId: 'job:alpha',
  taskId: 'task:alpha',
  queueSubject: 'queue:alpha',
  queueSubjectAliases: ['job:alpha', 'queue:alpha', 'task:alpha'],
  queueKey: 'queue:alpha',
  run: 'run:auto-drain',
  lane: 'lane:coordinator'
});

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
});

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
});
```

The coordinator gate helpers write compact replayable records for `selected`, `started`, `passed`, `failed`, and `skipped` lifecycle steps. Each record carries `kind`, `status`, `gateName`, and optional job/task/queue aliases (`jobId`, `taskId`, `queueSubject`, `queueSubjectAliases`, `queueKey`, `queueItemId`) so default auto-drain can explain why a gate moved forward or stopped without replaying raw terminal logs.

### Continuous Pool Lifecycle

```ts
const log = createEventLog();

appendContinuousPoolStartedEvent(log, {
  run: 'run:pool-1',
  lane: 'lane:continuous',
  task: 'task:pool-1'
});

appendContinuousPoolWorkerLeasedEvent(log, {
  run: 'run:pool-1',
  worker: 'worker:1',
  task: 'task:pool-1',
  lane: 'lane:continuous',
  leaseScope: 'lease:scope:a'
});

appendContinuousPoolWorkerHeartbeatEvent(log, {
  run: 'run:pool-1',
  worker: 'worker:1',
  task: 'task:pool-1',
  lane: 'lane:continuous',
  decision: 'worker:alive',
  leaseScopes: ['lease:scope:a', 'lease:scope:b']
});

appendContinuousPoolHumanBlockedEvent(log, {
  run: 'run:pool-1',
  worker: 'worker:1',
  task: 'task:block-1',
  lane: 'lane:continuous',
  decision: 'decision:human-blocked'
});

const kinds = replayEventLog(
  log,
  createEventLogCheckpoint(log, [], { cursor: 0 }),
  (state, record) => {
    state.push(record.value.kind);
    return state;
  }
  ).state;
```

The continuous pool lifecycle helpers write compact records for long-running swarm pools: `pool.started`, `worker.scheduled`, `worker.started`, `worker.heartbeat`, `worker.leased`, `worker.finished`, `worker.failed`, `worker.drained`, `bundle.collected`, `decision.written`, `patch.applied`, `queue.refilled`, `human.blocked`, and `pool.drained`. Each record keeps the same replay-friendly core fields: `run`, `worker`, `task`, `lane`, `decision`, and optional `leaseScope`/`leaseScopes`.

### Bundle Synthesis Lifecycle

```ts
appendBundleExpectedEvent(log, {
  bundleId: 'bundle:1',
  run: 'run:bundle-1',
  task: 'task:bundle-1',
  lane: 'lane:bundle-events'
});

appendPatchGeneratedEvent(log, {
  bundleId: 'bundle:1',
  run: 'run:bundle-1',
  task: 'task:bundle-1',
  lane: 'lane:bundle-events',
  patchPath: 'agent-runs/bundle-1/changes.patch',
  changedPaths: ['packages/frontier-event-log/src/event-log.ts']
});

appendNoChangeEvidenceEvent(log, {
  bundleId: 'bundle:2',
  run: 'run:bundle-2',
  task: 'task:bundle-2',
  lane: 'lane:bundle-events',
  evidencePaths: ['agent-runs/bundle-2/evidence.json']
});
```

The bundle synthesis helpers write compact records with a shared `decision` vocabulary: `expected`, `written`, `generated`, `missing`, `no-change`, `synthesized`, and `rejected`. Use `bundleId` as the subject key and keep optional artifact paths in `bundlePath`, `patchPath`, and `evidencePaths` when you need them.

### Semantic Change Streams

```ts
const log = createEventLog();

appendSemanticSliceClaimedEvent(log, {
  semanticRegionKey: 'region:src/apply.ts#apply',
  sourceHead: 'head-a',
  currentHead: 'head-b',
  taskId: 'task:semantic-merge',
  leaseKey: 'lease:src/apply.ts#apply'
});

appendSemanticLeaseAcquiredEvent(log, {
  semanticRegionKey: 'region:src/apply.ts#apply',
  sourceHead: 'head-a',
  currentHead: 'head-b',
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

const records = log.read(0).records;
const regionRecords = filterSemanticChangeStreamEvents(records, {
  semanticRegionKey: 'region:src/apply.ts#apply'
});
const promotedRecords = filterSemanticChangeStreamEvents(records, {
  promotionParent: 'lane:root'
});

const replay = replaySemanticChangeStreamEvents(
  log,
  createEventLogCheckpoint(log, [], { cursor: 0 }),
  (state, record) => {
    state.push(record.value.kind);
    return state;
  },
  { leaseKey: 'lease:src/apply.ts#apply' }
);
```

The semantic stream helpers append ordinary event-log records for `slice.claimed`, `slice.applied`, `lease.acquired`, `lease.released`, `merge.promoted`, and `merge.superseded` with `kind`, `semanticRegionKey`, `sourceHead`, `currentHead`, `taskId`, and lease/promotion identity fields so autonomous merge flow can replay or filter without importing swarm runtime packages. Use `filterSemanticChangeStreamEvents()` to keep only records for a region, lease, task, or promotion parent before replaying them into a dashboard or report. Use `replaySemanticChangeStreamEvents()` when you want a reducer to see only the matching slice of the log.

### Model Routing Feedback Events

```ts
const log = createEventLog();

appendModelChosenEvent(log, {
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

const records = filterModelRoutingFeedbackEvents(log.read(0).records, {
  taskKind: 'routing-feedback',
  model: 'gpt-5.4-mini'
});
```

The structural feedback helpers append ordinary event-log records with `kind`, `taskKind`, and `model` fields so routing telemetry can be replayed or filtered without importing a higher-level worker package. Use `filterModelRoutingFeedbackEvents()` to keep only records for a given task kind, model, or event kind before replaying them into a dashboard or report.

### Temporal State And Diff

`stateAtTime()` materializes state at an offset, cursor, high-watermark, or timestamp by replaying from a checkpoint. `diffBetweenTimes()` materializes two temporal states and returns a Frontier patch between them. For patch-event logs, `applyPatchEventRecord()` is the reducer.

```ts
const atCursor = stateAtTime(log, checkpoint, applyPatchEventRecord, {
  at: { offset: 128 }
});

const change = diffBetweenTimes(log, checkpoint, applyPatchEventRecord, {
  from: { offset: 64 },
  to: { timestamp: Date.now() }
});
```

### Patch Events

```ts
appendPatchEvent(log, patch, {
  key: 'doc:1',
  metadata: { actor: 'alice' }
});
```

Patch events store `{ kind: 'patch', patch, metadata? }` values in the log. They are ordinary event-log records and can be read, compacted, or retained like any other keyed event.

## Subpath Imports

```ts
import { createEventLog } from '@shapeshift-labs/frontier-event-log';
import { createEventLog as createEventLogSubpath } from '@shapeshift-labs/frontier-event-log/event-log';
```

Both imports expose the same event-log API.

## Package Scope

This package owns:

- in-memory event logs,
- snapshot checkpoints and bounded replay helpers,
- agent/swarm replay summaries for coordinator dashboards,
- bundle lifecycle and synthesis event records,
- temporal state-at-time and diff-between-times helpers,
- generic replay storage for snapshot plus change-log adapters,
- append batching and bounded replay windows,
- consumer cursors and acknowledgements,
- capacity retention policies,
- keyed compaction and tombstone dropping,
- semantic change stream event helpers,
- model routing feedback event helpers,
- Frontier patch event records.

It does not own:

- diff/apply primitives,
- binary patch codecs,
- app-state subscriptions,
- normalized query caches,
- structured telemetry sinks,
- CRDT documents, branches, sync, awareness, or rich text.

## TypeScript

The package ships ESM JavaScript plus `.d.ts` declarations for the root export and `./event-log` subpath. The package-local TypeScript source lives in `src/` and compiles directly to `dist/`.

## Validation

```sh
npm test
npm run fuzz
npm run bench
npm run pack:dry
```

The package test suite covers root and subpath imports, append/read behavior, clone isolation, retention policies, keyed compaction, batch limits, consumers, checkpoint replay, agent/swarm replay summaries, bundle lifecycle records, temporal state/diff, replay storage, patch events, and randomized operation sequences.

## Benchmarks

Run the package-local benchmark:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 120 rounds:

| Fixture | Median | p95 |
| --- | ---: | ---: |
| Append keyed JSON event | 3.71 us | 4.51 us |
| Read replay window, 32 records | 1.57 us | 1.71 us |
| Consumer read and ack | 0.42 us | 0.47 us |
| Compact keyed log, 1k records | 156.71 us | 171.73 us |
| Append batch compactOnAppend, 1k records | 98.18 us | 109.93 us |
| Replay from checkpoint, 64 records | 26.65 us | 28.95 us |
| State at offset, 64 patch events | 11.68 us | 11.94 us |
| Diff between offsets, 64 patch events | 19.41 us | 19.85 us |
| Replay storage append/read checkpoint | 11.03 us | 11.47 us |
| Append Frontier patch event | 2.14 us | 2.73 us |

These are Frontier-only package measurements, not competitor comparisons.
Replay and consumer fixtures use preseeded retained logs so the timed work is read/cursor behavior, not fixture construction.

## License

MIT. See [LICENSE](./LICENSE).
