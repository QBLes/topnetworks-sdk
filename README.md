# topnetworks

TypeScript SDK for [TopNetworks](https://topnetworks.com) — the intelligence layer for AI agents.

Live health, latency, pricing, smart routing, model intelligence, compliance, and decision tools for 52+ AI providers. Zero dependencies. Works everywhere.

[![npm](https://img.shields.io/npm/v/topnetworks)](https://www.npmjs.com/package/topnetworks)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Install

```bash
npm install topnetworks
```

```bash
pnpm add topnetworks
```

```bash
bun add topnetworks
```

## Quick Start

```typescript
import { TopNetworks } from 'topnetworks'

const tn = new TopNetworks()

// Which provider should I use right now?
const { pick } = await tn.pick({ task: 'llm', needs: ['vision'] })
console.log(pick.provider_name)  // "Google Gemini"

// Does this model support parallel tool calls?
const { function_calling } = await tn.functionCalling({ provider: 'openai' })
console.log(function_calling[0].parallel_calls_supported)  // true

// Is this provider HIPAA-compliant?
const { compliance } = await tn.compliance({ provider: 'anthropic', hipaa: true })
console.log(compliance[0].hipaa_baa_available)  // true

// What's the cheapest option with a quality floor?
const { cheapest } = await tn.cheapest({ task: 'llm', minQuality: 'mmlu:85' })
console.log(cheapest[0].provider_name, cheapest[0].estimated_cost_usd)
```

**No API key. No signup. No rate limits. Completely free.**

---

## API Reference

### Constructor

```typescript
const tn = new TopNetworks({
  baseUrl: 'https://topnetworks.com',  // default
  timeout: 30000,                       // ms, default
  headers: { 'X-Custom': 'value' },    // optional
  fetch: customFetch,                   // optional, e.g. for testing
})
```

---

## Live Status

### `health()`
Live status for all 52+ providers.
```typescript
const { providers, summary } = await tn.health()
console.log(summary)
// { operational: 48, degraded: 2, outage: 1, unknown: 1, total: 52 }
```

### `healthPremium()`
Enhanced health analytics — uptime %, p95 latency, incident count, trend. Requires x402 payment ($0.001 USDC on Base).
```typescript
const { providers } = await tn.healthPremium()
console.log(providers['anthropic'])
// { uptime_pct: 99.87, p95_response_ms: 245, trend: 'stable', ... }
```

### `freshness({ provider })`
Data freshness and drift score for a provider.
```typescript
const data = await tn.freshness({ provider: 'openai' })
console.log(data.fresh, data.age_seconds, data.drift_score)
```

### `latency({ provider, window? })`
Real latency percentiles (p50/p95/p99) from live polling. Window: `1h` | `6h` | `24h`.
```typescript
const data = await tn.latency({ provider: 'openai', window: '1h' })
console.log(data.percentiles)  // { p50_ms: 180, p95_ms: 340, ... }
console.log(data.ttft_estimate_ms)  // 90
```

### `incidents({ hours?, severity?, provider? })`
De-duplicated outage and degradation feed.
```typescript
const { incidents, summary } = await tn.incidents({ hours: 24 })
```

### `changelog({ days?, provider? })`
Status change feed — like RSS for AI infrastructure.
```typescript
const { changes } = await tn.changelog({ days: 7 })
```

---

## Decision Tools

### `pick({ task, budget?, minContext?, needs?, avoid?, freeOnly? })`
Smart single-call provider selection.
```typescript
const { pick, runners_up } = await tn.pick({
  task: 'llm',
  needs: ['vision', 'function_calling'],
  budget: 5,
  minContext: 128000,
})
```

### `failover({ primary, task?, limit?, maxCostPer1m? })`
Ordered failover chain when your primary provider fails.
```typescript
const { alternatives } = await tn.failover({ primary: 'openai', task: 'llm' })
```

### `recommend({ task?, avoid?, limit?, freeOnly? })`
Ranked operational alternatives by task type.
```typescript
const { recommendations } = await tn.recommend({ task: 'image', freeOnly: true })
```

### `compare({ providers, metrics? })`
Head-to-head comparison of 2-10 providers.
```typescript
const { comparison } = await tn.compare({
  providers: ['openai', 'anthropic', 'deepseek'],
})
```

### `cheapest({ task, inputTokens?, outputTokens?, minQuality?, limit? })`
Budget optimizer with optional quality floor.
```typescript
const { cheapest } = await tn.cheapest({ task: 'llm', minQuality: 'mmlu:85' })
```

### `costEstimate({ provider, inputTokens, outputTokens, cachedTokens?, model? })`
Pre-flight token cost estimation with cache breakdown.
```typescript
const est = await tn.costEstimate({
  provider: 'anthropic',
  inputTokens: 100_000,
  outputTokens: 10_000,
  cachedTokens: 50_000,
})
console.log(`Total: $${est.estimated_total_usd}`)
console.log(`Cache savings: $${est.breakdown.cache_savings_usd}`)
```

---

## Provider Data

### `pricing({ provider?, task?, freeOnly?, compare? })`
Unified token, image, TTS, STT, and embedding pricing.
```typescript
const { pricing } = await tn.pricing({ task: 'llm' })
```

### `models({ provider?, task?, vision?, functionCalling?, jsonMode?, minContext? })`
Model capability registry — context window, capabilities, knowledge cutoff.
```typescript
const { models } = await tn.models({ vision: true, minContext: 200000 })
```

### `rateLimits({ provider?, tier?, freeOnly?, minRpm? })`
Published RPM, RPD, TPM limits per provider and tier.
```typescript
const { rate_limits } = await tn.rateLimits({ provider: 'groq', tier: 'free' })
```

### `benchmarks({ task?, sortBy?, provider?, limit? })`
MMLU, HumanEval, MATH, GPQA, MGSM benchmark scores.
```typescript
const { benchmarks } = await tn.benchmarks({ sortBy: 'humaneval', limit: 5 })
```

### `quotaCheck({ provider, tier?, plannedRpm?, plannedTpm? })`
Will your planned workload get rate-limited?
```typescript
const check = await tn.quotaCheck({ provider: 'groq', plannedRpm: 50 })
console.log(check.verdict)  // 'safe' | 'tight' | 'exceeds'
```

---

## Model Intelligence

### `functionCalling({ provider?, parallel_only?, supported_only? })`
Per-model function calling capabilities — parallel support, max tools, forced mode, tool_choice options.
```typescript
const { function_calling } = await tn.functionCalling({ parallel_only: true })
for (const m of function_calling) {
  console.log(`${m.provider_id}/${m.model_id}: parallel=${m.parallel_calls_supported}, max_tools=${m.max_tools_per_request}`)
}
```

### `deprecations({ provider?, status? })`
Model deprecation and sunset tracker. Status: `active` | `warning` | `deprecated` | `sunset`.
```typescript
const { deprecations, summary } = await tn.deprecations({ status: 'deprecated' })
for (const d of deprecations) {
  console.log(`${d.model_name} → replace with ${d.replacement_model_name} by ${d.sunset_date}`)
}
```

### `maxOutputTokens({ provider?, min_output?, task?, limit? })`
Max output tokens per model, sorted descending. Prevents silent truncation.
```typescript
const { max_output_tokens } = await tn.maxOutputTokens({ min_output: 32000 })
console.log(max_output_tokens[0])
// { provider_id: 'openai', model_id: 'o3', max_output_tokens: 100000, context_window: 200000 }
```

### `logprobSupport({ provider?, supported_only? })`
Which providers/models return log probabilities. Essential for confidence scoring.
```typescript
const { logprob_support } = await tn.logprobSupport({ supported_only: true })
// openai/gpt-4o: max_top_logprobs=20
// groq/llama-3.3-70b: supported
// anthropic: NOT supported
```

### `embeddingQuality({ provider?, task_type?, min_score?, limit? })`
MTEB benchmark scores for embedding models. Task types: `retrieval` | `clustering` | `reranking` | `sts`.
```typescript
const { embedding_quality } = await tn.embeddingQuality({ task_type: 'retrieval', limit: 5 })
for (const e of embedding_quality) {
  console.log(`${e.model_name}: MTEB ${e.mteb_score} (rank #${e.mteb_rank})`)
}
// voyage-3: MTEB 67.1 (rank #1)
// text-embedding-3-small: MTEB 62.3
// text-embedding-3-large: MTEB 55.4 (rank #8)
```

### `resolveAlias({ alias?, provider? })`
Resolve a model alias to its current pinned snapshot. Omit `alias` to get the full table.
```typescript
const record = await tn.resolveAlias({ alias: 'gpt-4o' })
console.log(record.resolved_model_id)  // "gpt-4o-2024-11-20"
```

### `jsonMode({ provider?, model?, schemaEnforcementOnly?, jsonModeOnly? })`
JSON output mode support per model — json_object, strict schema enforcement, workarounds.
```typescript
const { json_mode } = await tn.jsonMode({ schemaEnforcementOnly: true })
```

### `streamingLatency({ provider?, model?, sort? })`
TTFT and throughput benchmarks per model. Sort by `ttft` or `tpt`.
```typescript
const { streaming_latency } = await tn.streamingLatency({ sort: 'ttft' })
```

### `modelVersions({ provider?, model?, pinnableOnly?, hasBreakingChanges? })`
Model version history, release dates, pinnable snapshots, breaking changes.
```typescript
const { model_versions } = await tn.modelVersions({ hasBreakingChanges: true })
```

### `websocketSupport({ provider?, websocketOnly?, category? })`
WebSocket vs SSE streaming support per provider.
```typescript
const { websocket_support } = await tn.websocketSupport({ websocketOnly: true })
```

### `contextWindow({ provider?, model?, minContext?, effectiveOnly? })`
Advertised vs effective (tested) context window sizes. Includes recommended max fill %.
```typescript
const { context_windows } = await tn.contextWindow({ minContext: 200000 })
// context_windows[0]: { model_id: "gemini-2.5-pro", advertised: 1048576, effective: 500000 }
```

### `thinkingSupport({ provider?, model?, supportedOnly?, visibleThinking?, budgetConfigurable? })`
Extended thinking / reasoning mode support — params, pricing, visibility, budget.
```typescript
const { thinking_support } = await tn.thinkingSupport({ supportedOnly: true })
```

### `multimodal({ provider?, model?, inputType?, outputType? })`
Input/output modality matrix — text, image, audio, video, PDF per model.
```typescript
const { multimodal } = await tn.multimodal({ inputType: 'image' })
// { inputs: ["text","image","audio","video","pdf"], outputs: ["text","image","audio"] }
```

### `structuredOutput({ provider?, model?, strictOnly?, constrainedDecoding? })`
JSON schema enforcement beyond basic JSON mode. Strict enforcement, constrained decoding, failure modes.
```typescript
const { structured_output } = await tn.structuredOutput({ strictOnly: true })
```

---

## Cost & Batch

### `promptCaching({ provider?, supported_only? })`
Prompt caching support, TTL, and savings per provider. Up to 90% cost reduction on repeated system prompts.
```typescript
const { prompt_caching } = await tn.promptCaching({ supported_only: true })
for (const p of prompt_caching) {
  console.log(`${p.provider_id}: ${p.savings_pct}% savings, TTL=${p.cache_ttl_minutes}min, min=${p.min_cacheable_tokens} tokens`)
}
// anthropic: 90% savings, TTL=5min, min=1024 tokens
// openai: 50% savings, TTL=unknown (automatic)
// google-gemini: 75% savings, TTL=60min, min=32768 tokens
```

### `batchApi({ provider?, available_only? })`
Batch API availability, discount %, max batch size, and typical turnaround time.
```typescript
const { batch_api } = await tn.batchApi({ available_only: true })
for (const b of batch_api) {
  console.log(`${b.provider_id}: ${b.discount_pct}% off, ${b.typical_turnaround_max_hours}hr max`)
}
// openai: 50% off, 24hr max
// anthropic: 50% off, 696hr max (29 days)
// groq: 50% off (promo), 168hr max
```

### `fineTuning({ provider?, available_only?, method? })`
Fine-tuning availability, supported models, methods (LoRA/full/DPO), and cost.
```typescript
const { fine_tuning } = await tn.fineTuning({ available_only: true })
for (const f of fine_tuning) {
  console.log(`${f.provider_id}: ${f.supported_models.join(', ')} — methods: ${f.methods.join(', ')}`)
}
```

### `audioPricing({ provider?, type?, realtime_only?, free_only? })`
STT and TTS pricing comparison. Type: `stt` | `tts` | `both`.
```typescript
const { audio_pricing } = await tn.audioPricing({ type: 'stt' })
for (const a of audio_pricing) {
  console.log(`${a.provider_id}/${a.model_name}: $${a.price_per_minute}/min, realtime=${a.realtime_supported}`)
}
// deepgram/nova-3: $0.0043/min, realtime=true
// openai/whisper-1: $0.006/min, realtime=false
// assemblyai/best: $0.0062/min, realtime=true
```

### `reranking({ provider?, available_only?, multilingual_only? })`
Reranking API availability and pricing. Essential for RAG pipelines.
```typescript
const { reranking } = await tn.reranking({ available_only: true })
for (const r of reranking) {
  console.log(`${r.provider_id}/${r.model_name}: $${r.price_per_1k_queries}/1k queries, max ${r.max_documents_per_query} docs`)
}
// cohere/rerank-english-v3.5: $2.00/1k, max 1000 docs
// voyage-ai/rerank-2: $0.05/1k, max 1000 docs (40x cheaper)
```

### `taskCost({ taskType, inputTokens?, outputTokens?, cachedTokens?, limit?, freeOnly? })`
Rank ALL providers by cost for a task type. Cheapest first.
```typescript
const { providers_ranked } = await tn.taskCost({ taskType: 'chat' })
```

### `cachingGranularity({ provider?, supportsCaching? })`
Caching mechanics — cacheable elements, min tokens, TTL, auto vs explicit.
```typescript
const { caching_granularity } = await tn.cachingGranularity({ supportsCaching: true })
```

### `freeTier({ provider?, permanentOnly?, hasFreeTier? })`
Detailed free tier breakdown — permanent vs trial, caps, included models.
```typescript
const { free_tiers } = await tn.freeTier({ permanentOnly: true })
```

### `tokenEstimate({ text, provider?, model? })`
Estimate token count across tokenizer families. POST endpoint, max 50k chars.
```typescript
const { estimates, summary } = await tn.tokenEstimate({ text: 'Your prompt here...' })
console.log(summary)  // { min_tokens: 6, max_tokens: 8, avg_tokens: 7 }
```

### `costForecast({ requestsPerDay?, avgInputTokens?, avgOutputTokens?, cacheHitRate?, task?, limit? })`
Project daily/weekly/monthly costs across providers for a usage pattern.
```typescript
const { forecasts } = await tn.costForecast({ requestsPerDay: 500, avgInputTokens: 4000, avgOutputTokens: 1000 })
console.log(`Cheapest: $${forecasts[0].monthly_cost}/month on ${forecasts[0].provider_id}`)
```

---

## Trust & Compliance

### `compliance({ provider?, certification?, hipaa?, gdpr? })`
SOC2, HIPAA, ISO27001, GDPR certifications per provider. DPA and BAA availability.
```typescript
// Who has HIPAA BAA available?
const { compliance } = await tn.compliance({ hipaa: true })
for (const c of compliance) {
  console.log(`${c.provider_id}: SOC2 ${c.soc2_type}, regions: ${c.data_residency_regions.join(', ')}`)
}

// Filter by specific cert
const gdprOnly = await tn.compliance({ certification: 'gdpr' })
```

### `dataRetention({ provider?, zdr_available?, no_training? })`
Prompt logging policies, retention periods, opt-out options, and ZDR availability.
```typescript
const { data_retention } = await tn.dataRetention({ no_training: true })
for (const d of data_retention) {
  console.log(`${d.provider_id}: logged=${d.prompts_logged}, retention=${d.retention_days}d, ZDR=${d.zero_data_retention_available}`)
}
// groq: logged=false, retention=0d, ZDR=true
// openai: logged=true, retention=30d, ZDR=true (Enterprise only)
```

### `sla({ provider?, sla_available_only?, min_uptime? })`
Published uptime SLA guarantees. Note: separate from observed uptime in `healthPremium()`.
```typescript
const { sla } = await tn.sla({ sla_available_only: true })
for (const s of sla) {
  console.log(`${s.provider_id}: ${s.guaranteed_uptime_pct}% SLA (${s.sla_tier_required} tier)`)
}
// google-gemini: 99.9% (paid)
// aws-bedrock: 99.9% (paid)
// azure-openai: 99.9% (paid)
// anthropic: no published SLA
```

### `overflowBehaviour({ provider?, behaviour? })`
What happens when context limit is exceeded — error, silent truncation, or sliding window.
```typescript
const { overflow_behaviour, summary } = await tn.overflowBehaviour()
console.log(summary.silent_truncators)  // ['cohere'] — providers that silently drop context

// Filter to find dangerous ones
const { overflow_behaviour: risky } = await tn.overflowBehaviour({ behaviour: 'truncate' })
```

### `openaiCompat({ provider?, compatible_only?, drop_in_only? })`
OpenAI-compatible API matrix — base URLs, compatible endpoints, and known quirks.
```typescript
const { openai_compat } = await tn.openaiCompat({ drop_in_only: true })
for (const p of openai_compat) {
  console.log(`${p.provider_id}: ${p.base_url}`)
  if (p.known_quirks.length) console.log('  quirks:', p.known_quirks)
}
// groq: https://api.groq.com/openai/v1
// deepseek: https://api.deepseek.com/v1
// together-ai: https://api.together.xyz/v1
// cerebras: https://api.cerebras.ai/v1
```

### `errorCodes({ provider?, category?, retryableOnly?, httpStatus? })`
Cross-provider error code taxonomy with retry guidance.
```typescript
const { error_codes } = await tn.errorCodes({ retryableOnly: true })
```

### `rateLimitRecovery({ provider? })`
429 recovery guide — retry headers, reset window semantics, backoff strategy.
```typescript
const { rate_limit_recovery } = await tn.rateLimitRecovery({ provider: 'openai' })
```

### `regions({ provider?, region?, model?, euOnly? })`
Inference regions per provider. EU availability, per-model region matrices.
```typescript
const { regions } = await tn.regions({ euOnly: true })
```

### `uptimeHistory({ provider, period? })`
Daily uptime % timeseries (7d/30d/90d) from live health polling.
```typescript
const data = await tn.uptimeHistory({ provider: 'openai', period: '30d' })
console.log(data.overall_uptime_pct)  // 99.4
```

### `guardrails({ provider?, configurableOnly?, canDisable?, category? })`
Content filtering config per provider — categories, strictness, false positive risk.
```typescript
const { guardrails } = await tn.guardrails({ canDisable: true })
```

### `rateLimitStatus({ provider? })`
Live congestion from polling data — response time trends, error rates, congestion level.
```typescript
const { rate_limit_status } = await tn.rateLimitStatus()
const avoid = rate_limit_status.filter(r => r.congestion === 'critical').map(r => r.provider_id)
```

### `migrationGuide({ from?, to?, maxDifficulty?, dropInOnly? })`
Provider switch guide — param mapping, missing features, auth changes, gotchas.
```typescript
const { migration_guides } = await tn.migrationGuide({ from: 'openai', to: 'deepseek' })
console.log(migration_guides[0].difficulty)  // "drop_in"
```

---

## Trust & Identity

### `attest({ provider, model, output?, payloadHash?, agentId? })`
Attest that a specific output was produced by a specific model. Returns attestation ID + verify URL.
```typescript
const att = await tn.attest({
  provider: 'openai',
  model: 'gpt-4o',
  output: 'The answer is 42.',
  agentId: 'my-agent',
})
console.log(att.attestation_id, att.verify_url)
```

### `handoff({ fromAgent, toAgent, taskId?, context? })`
Record an agent-to-agent task handoff for audit trail.
```typescript
const h = await tn.handoff({
  fromAgent: 'planner-agent',
  toAgent: 'executor-agent',
  taskId: 'task-123',
  context: 'Execute the deployment plan',
})
console.log(h.handoff_id, h.verify_url)
```

---

## Webhooks

### `webhookSubscribe({ callbackUrl, events, providers?, secret?, expiresInHours? })`
Subscribe to real-time provider status change notifications.
```typescript
const sub = await tn.webhookSubscribe({
  callbackUrl: 'https://my-app.com/webhook',
  events: ['provider.down', 'provider.up', 'incident.new'],
  providers: ['openai', 'anthropic'],
  secret: 'my-hmac-secret',
})
console.log(sub.id)  // subscription ID
```

### `webhookStatus(id)`
Check subscription stats and delivery health.
```typescript
const status = await tn.webhookStatus(sub.id)
console.log(status.fire_count, status.fail_count, status.last_error)
```

### `webhookDelete(id)`
Deactivate a webhook subscription.
```typescript
await tn.webhookDelete(sub.id)
```

---

## Developer Tools

### `openapi()`
Get the full OpenAPI 3.1 specification.
```typescript
const spec = await tn.openapi()
```

### `mcp(method, params?, id?)`
Send a JSON-RPC 2.0 request to the MCP server (34 tools).
```typescript
const tools = await tn.mcp('tools/list')
const result = await tn.mcp('tools/call', {
  name: 'topnetworks_pick',
  arguments: { task: 'llm', needs: 'vision' },
})
```

### `sdkSupport({ provider?, language?, officialOnly?, openaiCompatOnly? })`
Official SDK availability per provider by language.
```typescript
const { sdk_support } = await tn.sdkSupport({ language: 'go', officialOnly: true })
```

### `apiChangelog({ provider?, type?, impact?, days?, limit? })`
Cross-provider API changelog — new models, deprecations, pricing changes.
```typescript
const { changelog } = await tn.apiChangelog({ impact: 'high', days: 30 })
```

---

## Error Handling

```typescript
import { TopNetworks, TopNetworksError } from 'topnetworks'

try {
  await tn.freshness({ provider: 'nonexistent' })
} catch (err) {
  if (err instanceof TopNetworksError) {
    console.log(err.status)   // 404
    console.log(err.body)     // { error: "Unknown provider", ... }
  }
}
```

---

## TypeScript

All request params and response types are fully exported:

```typescript
import type {
  PickResponse,
  HealthResponse,
  FunctionCallingResponse,
  ContextWindowResponse,
  ThinkingSupportResponse,
  MultimodalResponse,
  StructuredOutputResponse,
  CostForecastResponse,
  GuardrailsResponse,
  MigrationGuideResponse,
  // ... all 60 endpoints typed
} from 'topnetworks'
```

---

## Compatibility

- **Node.js** 18+ (uses built-in `fetch`)
- **Deno** ✅
- **Bun** ✅
- **Browsers** ✅ (ESM bundle)
- **Edge runtimes** (Vercel, Cloudflare Workers) ✅

---

## All 60 Endpoints

| Group | Endpoint | Method |
|-------|----------|--------|
| Live Status | `health()` | GET |
| Live Status | `healthPremium()` | GET · x402 |
| Live Status | `freshness({ provider })` | GET |
| Live Status | `latency({ provider, window? })` | GET |
| Live Status | `incidents({ hours?, severity? })` | GET |
| Live Status | `changelog({ days? })` | GET |
| Decision Tools | `pick({ task, ... })` | GET |
| Decision Tools | `failover({ primary, ... })` | GET |
| Decision Tools | `recommend({ task? })` | GET |
| Decision Tools | `compare({ providers })` | GET |
| Decision Tools | `cheapest({ task, ... })` | GET |
| Decision Tools | `costEstimate({ provider, ... })` | GET |
| Provider Data | `pricing({ task? })` | GET |
| Provider Data | `models({ task?, vision? })` | GET |
| Provider Data | `rateLimits({ provider? })` | GET |
| Provider Data | `benchmarks({ task? })` | GET |
| Provider Data | `quotaCheck({ provider })` | GET |
| Trust & Identity | `attest({ provider, model, ... })` | POST |
| Trust & Identity | `handoff({ fromAgent, toAgent, ... })` | POST |
| Webhooks | `webhookSubscribe({ callbackUrl, ... })` | POST |
| Webhooks | `webhookStatus(id)` | GET |
| Webhooks | `webhookDelete(id)` | DELETE |
| Developer Tools | `openapi()` | GET |
| Developer Tools | `mcp(method, params?)` | POST |
| Developer Tools | `sdkSupport({ language? })` | GET |
| Developer Tools | `apiChangelog({ impact? })` | GET |
| Model Intelligence | `functionCalling({ provider? })` | GET |
| Model Intelligence | `deprecations({ status? })` | GET |
| Model Intelligence | `maxOutputTokens({ provider? })` | GET |
| Model Intelligence | `logprobSupport({ provider? })` | GET |
| Model Intelligence | `embeddingQuality({ taskType? })` | GET |
| Model Intelligence | `resolveAlias({ alias? })` | GET |
| Model Intelligence | `jsonMode({ provider? })` | GET |
| Model Intelligence | `streamingLatency({ provider? })` | GET |
| Model Intelligence | `modelVersions({ provider? })` | GET |
| Model Intelligence | `websocketSupport({ provider? })` | GET |
| Model Intelligence | `contextWindow({ provider? })` | GET |
| Model Intelligence | `thinkingSupport({ provider? })` | GET |
| Model Intelligence | `multimodal({ inputType? })` | GET |
| Model Intelligence | `structuredOutput({ strictOnly? })` | GET |
| Cost & Batch | `promptCaching({ provider? })` | GET |
| Cost & Batch | `batchApi({ provider? })` | GET |
| Cost & Batch | `fineTuning({ provider? })` | GET |
| Cost & Batch | `audioPricing({ type? })` | GET |
| Cost & Batch | `reranking({ provider? })` | GET |
| Cost & Batch | `taskCost({ taskType })` | GET |
| Cost & Batch | `cachingGranularity({ provider? })` | GET |
| Cost & Batch | `freeTier({ provider? })` | GET |
| Cost & Batch | `tokenEstimate({ text })` | POST |
| Cost & Batch | `costForecast({ requestsPerDay? })` | GET |
| Trust & Compliance | `compliance({ provider? })` | GET |
| Trust & Compliance | `dataRetention({ provider? })` | GET |
| Trust & Compliance | `sla({ provider? })` | GET |
| Trust & Compliance | `overflowBehaviour({ provider? })` | GET |
| Trust & Compliance | `openaiCompat({ provider? })` | GET |
| Trust & Compliance | `errorCodes({ provider? })` | GET |
| Trust & Compliance | `rateLimitRecovery({ provider? })` | GET |
| Trust & Compliance | `regions({ provider? })` | GET |
| Trust & Compliance | `uptimeHistory({ provider })` | GET |
| Trust & Compliance | `guardrails({ provider? })` | GET |
| Trust & Compliance | `rateLimitStatus({ provider? })` | GET |
| Trust & Compliance | `migrationGuide({ from?, to? })` | GET |

---

## Links

- [API Documentation](https://topnetworks.com/api-docs)
- [OpenAPI Spec](https://topnetworks.com/api/v1/openapi.json)
- [GitHub](https://github.com/QBLes/topnetworks-sdk)

## License

MIT
