# topnetworks

TypeScript SDK for [TopNetworks](https://topnetworks.com) — the neutral intelligence layer for AI agents.

75 free API endpoints covering health monitoring, smart routing, cost optimization, model intelligence, agent protocols, compliance, and trust primitives across 52 AI providers.

[![npm version](https://img.shields.io/npm/v/topnetworks)](https://www.npmjs.com/package/topnetworks)
[![license](https://img.shields.io/npm/l/topnetworks)](LICENSE)

---

## Installation

```bash
npm install topnetworks
```

---

## Quick Start

```ts
import { TopNetworks } from 'topnetworks'

const tn = new TopNetworks()

// Check which providers are healthy right now
const health = await tn.health()
console.log(health.providers)

// Pick the best provider for your task
const pick = await tn.pick({ task: 'code_generation', budget_usd_per_1m: 5 })
console.log(pick.recommended_provider)
```

---

## Usage

```ts
import { TopNetworks } from 'topnetworks'

// Uses https://topnetworks.com by default
const tn = new TopNetworks()

// Or point at a custom base URL
const tn = new TopNetworks({ baseUrl: 'https://topnetworks.com' })
```

No API key required. All endpoints are free.

---

## Error Handling

```ts
import { TopNetworks, TopNetworksError } from 'topnetworks'

const tn = new TopNetworks()

try {
  const result = await tn.pick({ task: 'reasoning' })
} catch (err) {
  if (err instanceof TopNetworksError) {
    console.error(`${err.status} ${err.statusText}`, err.body)
  }
}
```

---

## TypeScript

Full TypeScript types included for all params and responses. Zero runtime dependencies.

```ts
import type { PickParams, PickResponse, AgentProtocolsResponse } from 'topnetworks'
```

---

## All Methods

### Live Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `health()` | `GET /api/v1/health` | Live health status across all providers |
| `healthPremium()` | `GET /api/v1/health/premium` | Premium health with extended metrics |
| `freshness(params?)` | `GET /api/v1/freshness` | Data freshness per provider |
| `latency(params?)` | `GET /api/v1/latency` | Measured latency per provider/model |
| `incidents(params?)` | `GET /api/v1/incidents` | Active and historical incidents |
| `changelog(params?)` | `GET /api/v1/changelog` | Provider changelog feed |

### Decision Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| `pick(params)` | `GET /api/v1/pick` | Best provider for a task + budget |
| `failover(params)` | `GET /api/v1/failover` | Ordered failover chain for a provider |
| `recommend(params?)` | `GET /api/v1/recommend` | Model recommendations by use case |
| `compare(params)` | `GET /api/v1/compare` | Side-by-side provider comparison |
| `cheapest(params?)` | `GET /api/v1/cheapest` | Cheapest provider meeting constraints |
| `costEstimate(params)` | `GET /api/v1/cost-estimate` | Estimated cost for a request |

### Provider Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `pricing(params?)` | `GET /api/v1/pricing` | Token pricing per provider/model |
| `models(params?)` | `GET /api/v1/models` | Available models per provider |
| `rateLimits(params?)` | `GET /api/v1/rate-limits` | Rate limit tiers per provider |
| `benchmarks(params?)` | `GET /api/v1/benchmarks` | Benchmark scores per model |
| `quotaCheck(params)` | `GET /api/v1/quota-check` | Whether a request fits quota |

### Trust & Identity

| Method | Endpoint | Description |
|--------|----------|-------------|
| `attest(params)` | `GET /api/v1/attest` | Agent identity attestation |
| `handoff(params)` | `GET /api/v1/handoff` | Structured agent handoff payload |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `webhookSubscribe(params)` | `POST /api/v1/webhooks` | Subscribe to provider event webhooks |
| `webhookStatus(params?)` | `GET /api/v1/webhooks` | List active webhook subscriptions |
| `webhookDelete(params)` | `DELETE /api/v1/webhooks` | Remove a webhook subscription |

### Developer Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| `openApiSpec()` | `GET /api/v1/openapi` | OpenAPI spec for TopNetworks API |
| `mcp()` | `GET /api/v1/mcp` | MCP server manifest |
| `sdkSupport(params?)` | `GET /api/v1/sdk-support` | Official SDK availability per provider |
| `apiChangelog(params?)` | `GET /api/v1/changelog/api` | Cross-provider API changelog |

### Model Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `functionCalling(params?)` | `GET /api/v1/function-calling` | Function/tool call support per model |
| `deprecations(params?)` | `GET /api/v1/deprecations` | Upcoming model deprecations |
| `maxOutputTokens(params?)` | `GET /api/v1/max-output-tokens` | Max output token limits per model |
| `logprobSupport(params?)` | `GET /api/v1/logprob-support` | Logprob availability per model |
| `embeddingQuality(params?)` | `GET /api/v1/embedding-quality` | Embedding model quality scores |
| `resolveAlias(params)` | `GET /api/v1/resolve-alias` | Resolve model alias to canonical ID |
| `jsonMode(params?)` | `GET /api/v1/json-mode` | JSON mode support per model |
| `streamingLatency(params?)` | `GET /api/v1/streaming-latency` | Time-to-first-token measurements |
| `modelVersions(params?)` | `GET /api/v1/model-versions` | Version history per model |
| `websocketSupport(params?)` | `GET /api/v1/websocket-support` | WebSocket/Realtime API support |
| `contextWindow(params?)` | `GET /api/v1/context-window` | Context window sizes per model |
| `thinkingSupport(params?)` | `GET /api/v1/thinking-support` | Extended thinking/reasoning support |
| `multimodal(params?)` | `GET /api/v1/multimodal` | Multimodal capabilities per model |
| `structuredOutput(params?)` | `GET /api/v1/structured-output` | Structured output (JSON schema) support |

### Cost & Batch

| Method | Endpoint | Description |
|--------|----------|-------------|
| `promptCaching(params?)` | `GET /api/v1/prompt-caching` | Prompt caching support and pricing |
| `batchApi(params?)` | `GET /api/v1/batch-api` | Batch API availability and discounts |
| `fineTuning(params?)` | `GET /api/v1/fine-tuning` | Fine-tuning availability and pricing |
| `audioPricing(params?)` | `GET /api/v1/audio-pricing` | Audio token pricing per provider |
| `reranking(params?)` | `GET /api/v1/reranking` | Reranking API support per provider |
| `taskCost(params)` | `GET /api/v1/task-cost` | Estimated cost for a task type |
| `cachingGranularity(params?)` | `GET /api/v1/caching-granularity` | Caching granularity levels |
| `freeTier(params?)` | `GET /api/v1/free-tier` | Free tier limits per provider |
| `tokenEstimate(params)` | `GET /api/v1/token-estimate` | Token count estimate for a prompt |
| `costForecast(params)` | `GET /api/v1/cost-forecast` | Projected cost over time |

### Trust & Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `compliance(params?)` | `GET /api/v1/compliance` | Compliance posture per provider |
| `dataRetention(params?)` | `GET /api/v1/data-retention` | Data retention policies |
| `sla(params?)` | `GET /api/v1/sla` | SLA commitments per provider |
| `overflowBehaviour(params?)` | `GET /api/v1/overflow-behaviour` | Behaviour when rate limits are hit |
| `openaiCompat(params?)` | `GET /api/v1/openai-compat` | OpenAI API compatibility details |
| `errorCodes(params?)` | `GET /api/v1/error-codes` | Error code catalogue per provider |
| `rateLimitRecovery(params?)` | `GET /api/v1/rate-limit-recovery` | Retry strategies per provider |
| `regions(params?)` | `GET /api/v1/regions` | Available deployment regions |
| `uptimeHistory(params)` | `GET /api/v1/uptime-history` | Historical uptime timeseries |
| `guardrails(params?)` | `GET /api/v1/guardrails` | Content filtering config per provider |
| `rateLimitStatus(params?)` | `GET /api/v1/rate-limit-status` | Live rate limit pressure per provider |
| `migrationGuide(params)` | `GET /api/v1/migration-guide` | Provider migration parameter mapping |

### Agent Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `agentProtocols(params?)` | `GET /api/v1/agent-protocols` | Agent protocol support (MCP, A2A, ACP, ANP, OAP) per provider |
| `knowledgeCutoff(params?)` | `GET /api/v1/knowledge-cutoff` | Training data knowledge cutoff dates per model |
| `toolCallFormat(params?)` | `GET /api/v1/tool-call-format` | Exact message role/format required for tool calls |
| `streamingProtocols(params?)` | `GET /api/v1/streaming-protocols` | SSE vs WebSocket details, events, known quirks |
| `outputReproducibility(params?)` | `GET /api/v1/output-reproducibility` | Seed support and deterministic output guarantees |
| `nativeTools(params?)` | `GET /api/v1/native-tools` | Built-in tools per provider (web search, code interpreter, etc.) |
| `modelTaskFit(params?)` | `GET /api/v1/model-task-fit` | Task suitability scores per model (code, reasoning, RAG, etc.) |
| `piiHandling(params?)` | `GET /api/v1/pii-handling` | Native PII detection and redaction capabilities |
| `contextCompression(params?)` | `GET /api/v1/context-compression` | Native context compression support |
| `securityCertifications(params?)` | `GET /api/v1/security-certifications` | SOC2, ISO27001, HIPAA, FedRAMP, and other certifications |
| `semanticCaching(params?)` | `GET /api/v1/semantic-caching` | Semantic similarity-based caching support |
| `mcpSupport(params?)` | `GET /api/v1/mcp-support` | Provider MCP client/server compliance |
| `modelLifecycle(params?)` | `GET /api/v1/model-lifecycle` | Model stage: GA, beta, preview, deprecated, sunset |
| `delegationSupport(params?)` | `GET /api/v1/delegation-support` | Secure agent delegation semantics (A2A, MCP, IAM) |
| `promptModeration(params?)` | `GET /api/v1/prompt-moderation` | Input-side prompt moderation and injection detection |

---

## License

MIT
