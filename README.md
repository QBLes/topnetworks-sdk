# topnetworks

TypeScript SDK for [TopNetworks](https://topnetworks.com) — the intelligence layer for AI agents.

Live health, latency, pricing, smart routing, and decision tools for 52+ AI providers. Zero dependencies. Works everywhere.

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

// Which provider should I use for an LLM task with vision?
const { pick } = await tn.pick({ task: 'llm', needs: ['vision'] })
console.log(pick.provider_name)  // "Google Gemini"
console.log(pick.reason)         // "Operational, fastest, $0.1/1M input, 1049K context, free tier"

// What's the cheapest option that still scores 85+ on MMLU?
const { cheapest } = await tn.cheapest({ task: 'llm', minQuality: 'mmlu:85' })
console.log(cheapest[0].provider_name, cheapest[0].estimated_cost_usd)

// OpenAI is down — who should I fail over to?
const { alternatives } = await tn.failover({ primary: 'openai' })
console.log(alternatives.map(a => a.provider_name))
```

**No API key. No signup. No rate limits. Completely free.**

## API

### Constructor

```typescript
const tn = new TopNetworks({
  baseUrl: 'https://topnetworks.com',  // default
  timeout: 30000,                       // ms, default
  headers: { 'X-Custom': 'value' },    // optional
  fetch: customFetch,                   // optional, e.g. for testing
})
```

### Live Status

#### `health()`

Live status for all 52+ providers.

```typescript
const { providers, summary } = await tn.health()
console.log(summary)
// { operational: 48, degraded: 2, outage: 1, unknown: 1, total: 52 }
console.log(providers['openai'])
// { status: 'operational', last_checked: '2026-03-21T10:00:00Z', response_time_ms: 112 }
```

#### `healthPremium()`

Enhanced health analytics — uptime %, p95 latency, incident count, trend. Requires x402 payment ($0.001 USDC on Base).

```typescript
const { providers } = await tn.healthPremium()
console.log(providers['anthropic'])
// { uptime_pct: 99.87, avg_response_ms: 98, p95_response_ms: 245, trend: 'stable', ... }
```

#### `freshness({ provider })`

Data freshness and drift score.

```typescript
const data = await tn.freshness({ provider: 'openai' })
console.log(data.fresh)         // true
console.log(data.age_seconds)   // 142
console.log(data.drift_score)   // 0.02
```

#### `latency({ provider, window? })`

Real latency percentiles from live polling.

```typescript
const data = await tn.latency({ provider: 'openai', window: '1h' })
console.log(data.percentiles)
// { p50_ms: 180, p95_ms: 340, p99_ms: 520, avg_ms: 210, min_ms: 95, max_ms: 720 }
console.log(data.ttft_estimate_ms)  // 90
```

#### `incidents({ hours?, severity?, provider? })`

De-duplicated outage and degradation feed.

```typescript
const { incidents, summary } = await tn.incidents({ hours: 24 })
console.log(summary)
// { total_incidents: 3, outages: 1, degraded: 2, ongoing: 0 }
for (const inc of incidents) {
  console.log(`${inc.provider_name}: ${inc.severity} for ${inc.duration_minutes}m`)
}
```

#### `changelog({ days?, provider? })`

Status change feed — like RSS for AI infrastructure.

```typescript
const { changes } = await tn.changelog({ days: 7 })
for (const c of changes) {
  console.log(`${c.provider_name}: ${c.from_status} → ${c.to_status} at ${c.changed_at}`)
}
```

### Decision Tools

#### `pick({ task, budget?, minContext?, needs?, avoid?, freeOnly? })`

Smart single-call provider selection. One call replaces querying multiple endpoints.

```typescript
const { pick, runners_up } = await tn.pick({
  task: 'llm',
  needs: ['vision', 'function_calling'],
  budget: 5,          // max $5 per 1M input tokens
  minContext: 128000,  // minimum 128K context
  avoid: ['deepseek'], // exclude providers
  freeOnly: false,
})
console.log(pick.provider_name, pick.model, pick.score)
```

#### `failover({ primary, task?, limit?, maxCostPer1m? })`

Ordered failover chain when your primary provider fails.

```typescript
const { primary, alternatives } = await tn.failover({
  primary: 'openai',
  task: 'llm',
  limit: 3,
})
console.log(`${primary.provider_name} is ${primary.status}`)
for (const alt of alternatives) {
  console.log(`  → ${alt.provider_name} (score: ${alt.score}) — ${alt.reason}`)
}
```

#### `recommend({ task?, avoid?, limit?, freeOnly? })`

Ranked provider recommendations.

```typescript
const { recommendations } = await tn.recommend({ task: 'image', freeOnly: true })
```

#### `compare({ providers, metrics? })`

Head-to-head comparison of 2-10 providers.

```typescript
const { comparison } = await tn.compare({
  providers: ['openai', 'anthropic', 'deepseek'],
  metrics: ['status', 'latency', 'price', 'benchmarks'],
})

for (const [id, data] of Object.entries(comparison)) {
  console.log(`${id}: ${data.status} | p50=${data.latency?.p50_ms}ms | $${data.pricing?.input_per_1m}/1M`)
}
```

#### `cheapest({ task, inputTokens?, outputTokens?, minQuality?, limit? })`

Find the cheapest operational provider with optional quality floor.

```typescript
const { cheapest } = await tn.cheapest({
  task: 'llm',
  inputTokens: 1_000_000,
  outputTokens: 500_000,
  minQuality: 'mmlu:85',
})
for (const p of cheapest) {
  console.log(`${p.provider_name}: $${p.estimated_cost_usd} (${p.model})`)
}
```

#### `costEstimate({ provider, inputTokens, outputTokens, cachedTokens?, model? })`

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
console.log('Cheaper alternatives:', est.cheaper_alternatives)
```

### Provider Data

#### `pricing({ provider?, task?, freeOnly?, compare? })`

Unified pricing across all providers.

```typescript
const { pricing } = await tn.pricing({ task: 'llm' })
for (const p of pricing) {
  console.log(`${p.provider_name} (${p.model}): $${p.input_per_1m}/1M in, $${p.output_per_1m}/1M out`)
}
```

#### `models({ provider?, task?, vision?, functionCalling?, jsonMode?, minContext? })`

Model capability registry.

```typescript
const { models } = await tn.models({ vision: true, minContext: 200000 })
for (const m of models) {
  console.log(`${m.provider_name} ${m.model_id}: ${m.context_window} ctx`)
}
```

#### `rateLimits({ provider?, tier?, freeOnly?, minRpm? })`

Published rate limits per provider and tier.

```typescript
const { rate_limits } = await tn.rateLimits({ provider: 'groq' })
for (const rl of rate_limits) {
  console.log(`${rl.tier}: ${rl.rpm} RPM, ${rl.tpm} TPM`)
}
```

#### `benchmarks({ task?, sortBy?, provider?, limit? })`

Public benchmark scores.

```typescript
const { benchmarks } = await tn.benchmarks({ sortBy: 'humaneval', limit: 5 })
for (const b of benchmarks) {
  console.log(`${b.model_id}: MMLU=${b.mmlu} HumanEval=${b.humaneval}`)
}
```

#### `quotaCheck({ provider, tier?, plannedRpm?, plannedTpm? })`

Rate limit feasibility check.

```typescript
const check = await tn.quotaCheck({
  provider: 'groq',
  plannedRpm: 50,
  plannedTpm: 100_000,
})
console.log(check.verdict)  // 'safe' | 'tight' | 'exceeds'
if (check.verdict === 'exceeds') {
  console.log('Try these instead:', check.alternatives)
}
```

### Trust & Identity

#### `register({ agentId, schemaVersion, integrityHash, ... })`

Register an agent output contract.

```typescript
const contract = await tn.register({
  agentId: 'my-agent-v2',
  schemaVersion: '1.0',
  integrityHash: 'sha256-abc123...',
  description: 'Weather forecast output schema',
  tags: ['weather', 'forecast'],
  ttlHours: 720,
})
console.log(contract.id, contract.verify_url)
```

#### `verify(id, { hash? })`

Verify a registered contract.

```typescript
const result = await tn.verify(contract.id, { hash: 'sha256-abc123...' })
console.log(result.valid, result.hash_match)
```

#### `sign({ signerId, payloadHash, metadata?, ttlHours? })`

Sign an input payload. Get a tamper-evident HMAC receipt.

```typescript
const receipt = await tn.sign({
  signerId: 'my-agent',
  payloadHash: 'sha256-def456...',
})
console.log(receipt.signature, receipt.validate_url)
```

#### `validate(id, { hash? })`

Validate a signed receipt.

```typescript
const valid = await tn.validate(receipt.id, { hash: 'sha256-def456...' })
console.log(valid.signature_valid, valid.hash_match)
```

### Developer Tools

#### `openapi()`

Get the full OpenAPI 3.1 specification.

```typescript
const spec = await tn.openapi()
console.log(spec.info.version)
```

#### `mcp(method, params?, id?)`

Send a JSON-RPC 2.0 request to the MCP server.

```typescript
// List available tools
const tools = await tn.mcp('tools/list')
console.log(tools.result)

// Call a tool
const result = await tn.mcp('tools/call', {
  name: 'topnetworks_pick',
  arguments: { task: 'llm', needs: 'vision' },
})
console.log(result.result)
```

## Error Handling

```typescript
import { TopNetworks, TopNetworksError } from 'topnetworks'

const tn = new TopNetworks()

try {
  await tn.freshness({ provider: 'nonexistent' })
} catch (err) {
  if (err instanceof TopNetworksError) {
    console.log(err.status)      // 404
    console.log(err.statusText)  // "Not Found"
    console.log(err.body)        // { error: "Unknown provider", available: [...] }
  }
}
```

## TypeScript

All request params and response types are fully typed and exported:

```typescript
import type { PickResponse, HealthResponse, Incident } from 'topnetworks'
```

## Compatibility

- **Node.js** 18+ (uses built-in `fetch`)
- **Deno** ✅
- **Bun** ✅
- **Browsers** ✅ (ESM bundle)
- **Edge runtimes** (Vercel, Cloudflare Workers) ✅

## Links

- [API Documentation](https://topnetworks.com/api-docs)
- [OpenAPI Spec](https://topnetworks.com/api/v1/openapi.json)
- [MCP Server](https://topnetworks.com/api/v1/mcp)
- [GitHub](https://github.com/QBLes/topnetworks-sdk)

## License

MIT
