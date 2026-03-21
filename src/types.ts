// ─── Common ──────────────────────────────────────────────────────────────────

export type ProviderStatus = 'operational' | 'degraded' | 'outage' | 'unknown'

export type TaskType =
  | 'llm' | 'chat' | 'text' | 'inference'
  | 'image' | 'vision'
  | 'embedding'
  | 'speech' | 'tts' | 'stt'
  | 'search'
  | 'video'
  | 'code'
  | 'agent'
  | 'multimodal'

export type LatencyWindow = '1h' | '6h' | '24h'

export type Severity = 'outage' | 'degraded' | 'all'

export type QuotaVerdict = 'safe' | 'tight' | 'exceeds'

// ─── /api/v1/health ──────────────────────────────────────────────────────────

export interface HealthProvider {
  status: ProviderStatus
  last_checked: string | null
  response_time_ms: number | null
}

export interface HealthResponse {
  timestamp: string
  providers: Record<string, HealthProvider>
  summary: {
    operational: number
    degraded: number
    outage: number
    unknown: number
    total: number
  }
}

// ─── /api/v1/health/premium ──────────────────────────────────────────────────

export interface HealthPremiumProvider {
  status: ProviderStatus
  name: string
  category: string
  uptime_pct: number | null
  avg_response_ms: number | null
  p95_response_ms: number | null
  recent_incidents: number
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data'
  degraded: boolean
  rate_limit_risk: string | null
  last_checked: string | null
}

export interface HealthPremiumResponse {
  timestamp: string
  window_hours: number
  providers: Record<string, HealthPremiumProvider>
  summary: {
    total: number
    operational: number
    degraded: number
    outage: number
    avg_uptime_pct: number
    avg_response_ms: number
    total_incidents: number
  }
}

// ─── /api/v1/freshness ───────────────────────────────────────────────────────

export interface FreshnessParams {
  provider: string
}

export interface FreshnessResponse {
  timestamp: string
  provider: string
  provider_name: string
  fresh: boolean
  age_seconds: number
  last_checked: string
  drift_score: number
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data'
  latency_trend_ms: number[]
}

// ─── /api/v1/latency ─────────────────────────────────────────────────────────

export interface LatencyParams {
  provider: string
  window?: LatencyWindow
}

export interface LatencyResponse {
  timestamp: string
  provider: string
  provider_name: string
  window: LatencyWindow
  samples: number
  percentiles: {
    p50_ms: number | null
    p95_ms: number | null
    p99_ms: number | null
    avg_ms: number | null
    min_ms: number | null
    max_ms: number | null
  }
  ttft_estimate_ms: number | null
  trend: 'improving' | 'stable' | 'declining' | 'insufficient_data'
  uptime_pct_in_window: number | null
}

// ─── /api/v1/incidents ───────────────────────────────────────────────────────

export interface IncidentsParams {
  hours?: number
  severity?: Severity
  provider?: string
}

export interface Incident {
  id: string
  provider_id: string
  provider_name: string
  category: string
  severity: 'outage' | 'degraded'
  started_at: string
  last_seen_at: string
  duration_minutes: number | null
  checks_affected: number
  description: string | null
  ongoing: boolean
}

export interface IncidentsResponse {
  timestamp: string
  query: {
    hours: number
    severity: string
    provider: string | null
    since: string
  }
  summary: {
    total_incidents: number
    outages: number
    degraded: number
    ongoing: number
  }
  incidents: Incident[]
}

// ─── /api/v1/changelog ───────────────────────────────────────────────────────

export interface ChangelogParams {
  days?: number
  provider?: string
}

export interface ChangelogEntry {
  provider_id: string
  provider_name: string
  category: string
  from_status: ProviderStatus
  to_status: ProviderStatus
  changed_at: string
  description: string | null
}

export interface ChangelogResponse {
  timestamp: string
  query: {
    days: number
    provider: string | null
    since: string
  }
  total_changes: number
  changes: ChangelogEntry[]
}

// ─── /api/v1/pick ────────────────────────────────────────────────────────────

export interface PickParams {
  task: TaskType
  budget?: number
  minContext?: number
  needs?: string | string[]
  avoid?: string | string[]
  freeOnly?: boolean
}

export interface PickCandidate {
  provider_id: string
  provider_name: string
  model: string
  status: ProviderStatus
  response_time_ms: number | null
  input_per_1m_usd: number | null
  output_per_1m_usd: number | null
  context_window: number | null
  capabilities: {
    vision: boolean
    function_calling: boolean
    json_mode: boolean
  }
  rate_limits: {
    tier: string
    rpm: number | null
    tpm: number | null
  }
  free_tier: boolean
  score: number
  reason: string
}

export interface PickResponse {
  timestamp: string
  query: {
    task: string
    budget: number | null
    min_context: number | null
    needs: string[]
    avoid: string[]
    free_only: boolean
  }
  pick: PickCandidate
  runners_up: PickCandidate[]
  note: string
}

// ─── /api/v1/failover ────────────────────────────────────────────────────────

export interface FailoverParams {
  primary: string
  task?: TaskType
  limit?: number
  maxCostPer1m?: number
}

export interface FailoverAlternative {
  provider_id: string
  provider_name: string
  category: string
  status: ProviderStatus
  response_time_ms: number | null
  input_per_1m_usd: number | null
  output_per_1m_usd: number | null
  free_tier: boolean
  score: number
  reason: string
}

export interface FailoverResponse {
  timestamp: string
  primary: {
    provider_id: string
    provider_name: string
    status: ProviderStatus
    response_time_ms: number | null
  }
  alternatives: FailoverAlternative[]
  note: string
}

// ─── /api/v1/recommend ───────────────────────────────────────────────────────

export interface RecommendParams {
  task?: TaskType
  avoid?: string | string[]
  limit?: number
  freeOnly?: boolean
}

export interface Recommendation {
  provider_id: string
  name: string
  category: string
  status: ProviderStatus
  response_time_ms: number | null
  free_tier: boolean
  score: number
  reason: string
}

export interface RecommendResponse {
  timestamp: string
  task: string
  recommendations: Recommendation[]
}

// ─── /api/v1/compare ─────────────────────────────────────────────────────────

export interface CompareParams {
  providers: string | string[]
  metrics?: string | string[]
}

export interface CompareProvider {
  provider_name: string
  category: string
  status: ProviderStatus
  response_time_ms: number | null
  uptime_pct: number | null
  latency: {
    p50_ms: number | null
    p95_ms: number | null
    p99_ms: number | null
    avg_ms: number | null
  } | null
  pricing: {
    input_per_1m: number | null
    output_per_1m: number | null
    per_image: number | null
    free_tier: boolean
  } | null
  benchmarks: Record<string, number> | null
  rate_limits: {
    tier: string
    rpm: number | null
    tpm: number | null
    rpd: number | null
  }[] | null
  models: {
    model_id: string
    context_window: number | null
    supports_vision: boolean
    supports_function_calling: boolean
  }[] | null
}

export interface CompareResponse {
  timestamp: string
  query: {
    providers: string[]
    metrics: string[]
  }
  comparison: Record<string, CompareProvider>
  note: string
}

// ─── /api/v1/cheapest ────────────────────────────────────────────────────────

export interface CheapestParams {
  task: TaskType
  inputTokens?: number
  outputTokens?: number
  minQuality?: string
  limit?: number
}

export interface CheapestProvider {
  provider_id: string
  provider_name: string
  status: ProviderStatus
  input_per_1m_usd: number | null
  output_per_1m_usd: number | null
  estimated_cost_usd: number
  model: string
  free_tier: boolean
  quality: Record<string, number> | null
}

export interface CheapestResponse {
  timestamp: string
  query: {
    task: string
    input_tokens: number
    output_tokens: number
    min_quality: string | null
  }
  cheapest: CheapestProvider[]
  note: string
}

// ─── /api/v1/cost-estimate ───────────────────────────────────────────────────

export interface CostEstimateParams {
  provider: string
  inputTokens: number
  outputTokens: number
  cachedTokens?: number
  model?: string
}

export interface CostEstimateResponse {
  timestamp: string
  provider: string
  provider_name: string
  model: string | null
  tokens: {
    input: number
    output: number
    cached: number
  }
  breakdown: {
    input_cost_usd: number
    output_cost_usd: number
    cache_savings_usd: number
  }
  estimated_total_usd: number
  cheaper_alternatives: {
    provider_id: string
    provider_name: string
    estimated_total_usd: number
    savings_pct: number
  }[]
}

// ─── /api/v1/pricing ─────────────────────────────────────────────────────────

export interface PricingParams {
  provider?: string
  task?: TaskType
  freeOnly?: boolean
  compare?: boolean
}

export interface PricingRecord {
  provider_id: string
  provider_name: string
  model: string
  input_per_1m: number | null
  output_per_1m: number | null
  per_image: number | null
  per_1m_chars_tts: number | null
  per_minute_stt: number | null
  per_1m_embedding: number | null
  free_tier: boolean
  free_tier_limit: string | null
}

export interface PricingResponse {
  timestamp: string
  query: {
    provider: string | null
    task: string | null
    free_only: boolean
  }
  count: number
  pricing: PricingRecord[]
}

// ─── /api/v1/models ──────────────────────────────────────────────────────────

export interface ModelsParams {
  provider?: string
  task?: TaskType
  vision?: boolean
  functionCalling?: boolean
  jsonMode?: boolean
  minContext?: number
}

export interface ModelRecord {
  provider_id: string
  provider_name: string
  model_id: string
  name: string
  task: string
  context_window: number | null
  max_output: number | null
  supports_vision: boolean
  supports_function_calling: boolean
  supports_streaming: boolean
  supports_json_mode: boolean
  knowledge_cutoff: string | null
  notes: string | null
}

export interface ModelsResponse {
  timestamp: string
  query: {
    provider: string | null
    task: string | null
    filters: Record<string, unknown>
  }
  count: number
  models: ModelRecord[]
}

// ─── /api/v1/rate-limits ─────────────────────────────────────────────────────

export interface RateLimitsParams {
  provider?: string
  tier?: string
  freeOnly?: boolean
  minRpm?: number
}

export interface RateLimitRecord {
  provider_id: string
  provider_name: string
  tier: string
  rpm: number | null
  rpd: number | null
  tpm: number | null
  tpd: number | null
  concurrent: number | null
  notes: string | null
}

export interface RateLimitsResponse {
  timestamp: string
  query: {
    provider: string | null
    tier: string | null
    free_only: boolean
  }
  count: number
  rate_limits: RateLimitRecord[]
}

// ─── /api/v1/benchmarks ──────────────────────────────────────────────────────

export interface BenchmarksParams {
  task?: string
  sortBy?: string
  provider?: string
  limit?: number
}

export interface BenchmarkRecord {
  provider_id: string
  provider_name: string
  model_id: string
  mmlu: number | null
  humaneval: number | null
  math: number | null
  gpqa: number | null
  mgsm: number | null
  hellaswag: number | null
}

export interface BenchmarksResponse {
  timestamp: string
  query: {
    task: string | null
    sort_by: string
    provider: string | null
    limit: number
  }
  count: number
  benchmarks: BenchmarkRecord[]
}

// ─── /api/v1/quota-check ─────────────────────────────────────────────────────

export interface QuotaCheckParams {
  provider: string
  tier?: string
  plannedRpm?: number
  plannedTpm?: number
}

export interface QuotaCheckResponse {
  timestamp: string
  provider: string
  provider_name: string
  tier: string
  planned: {
    rpm: number | null
    tpm: number | null
  }
  limits: {
    rpm: number | null
    rpd: number | null
    tpm: number | null
    tpd: number | null
    concurrent: number | null
  }
  verdict: QuotaVerdict
  details: string[]
  alternatives: {
    provider_id: string
    provider_name: string
    tier: string
    rpm: number | null
    tpm: number | null
    verdict: QuotaVerdict
  }[]
}

// ─── /api/v1/register (POST) ─────────────────────────────────────────────────

export interface RegisterParams {
  agentId: string
  schemaVersion: string
  integrityHash: string
  description?: string
  tags?: string[]
  ttlHours?: number
}

export interface RegisterResponse {
  id: string
  agent_id: string
  schema_version: string
  integrity_hash: string
  description: string | null
  tags: string[] | null
  registered_at: string
  expires_at: string | null
  verify_url: string
}

// ─── /api/v1/verify/{id} ────────────────────────────────────────────────────

export interface VerifyParams {
  hash?: string
}

export interface VerifyResponse {
  valid: boolean
  expired: boolean
  hash_match: boolean | null
  agent_id: string
  schema_version: string
  integrity_hash: string
  description: string | null
  registered_at: string
  expires_at: string | null
  verified_count: number
}

// ─── /api/v1/sign (POST) ────────────────────────────────────────────────────

export interface SignParams {
  signerId: string
  payloadHash: string
  metadata?: Record<string, unknown>
  ttlHours?: number
}

export interface SignResponse {
  id: string
  signature: string
  algorithm: string
  signer_id: string
  payload_hash: string
  signed_at: string
  expires_at: string | null
  validate_url: string
}

// ─── /api/v1/validate/{id} ──────────────────────────────────────────────────

export interface ValidateParams {
  hash?: string
}

export interface ValidateResponse {
  valid: boolean
  signature_valid: boolean
  hash_match: boolean | null
  signer_id: string
  payload_hash: string
  signed_at: string
  expires_at: string | null
  validated_count: number
}

// ─── /api/v1/mcp (POST) ─────────────────────────────────────────────────────

export interface McpResponse {
  jsonrpc: '2.0'
  id: number | string | null
  result?: unknown
  error?: {
    code: number
    message: string
    data?: unknown
  }
}

// ─── Client Options ──────────────────────────────────────────────────────────

export interface TopNetworksOptions {
  /** Base URL (default: https://topnetworks.com) */
  baseUrl?: string
  /** Custom fetch implementation */
  fetch?: typeof globalThis.fetch
  /** Default request timeout in ms (default: 30000) */
  timeout?: number
  /** Custom headers added to every request */
  headers?: Record<string, string>
}

// ─── Error ───────────────────────────────────────────────────────────────────

export interface TopNetworksErrorData {
  status: number
  statusText: string
  body: unknown
}
