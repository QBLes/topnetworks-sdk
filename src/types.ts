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

// ─── /api/v1/webhooks ────────────────────────────────────────────────────────

export type WebhookEvent = 'provider.down' | 'provider.up' | 'provider.degraded' | 'incident.new' | 'incident.resolved'

export interface WebhookSubscribeParams {
  callbackUrl: string
  events: WebhookEvent[]
  providers?: string[]
  secret?: string
  expiresInHours?: number
  metadata?: Record<string, unknown>
}

export interface WebhookSubscription {
  id: string
  callback_url: string
  events: WebhookEvent[]
  providers: string[] | null
  created_at: string
  expires_at: string | null
  active: boolean
  fire_count: number
  fail_count: number
  last_fired_at: string | null
  last_error: string | null
  metadata: Record<string, unknown>
}

export interface WebhookSubscribeResponse {
  subscription: WebhookSubscription
  verify_url: string
  manage_url: string
  note: string
}

export interface WebhookStatusResponse {
  subscription: WebhookSubscription
}

export interface WebhookDeleteResponse {
  deleted: boolean
  id: string
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

// ─── /api/v1/function-calling ────────────────────────────────────────────────

export interface FunctionCallingParams {
  provider?: string
  parallel_only?: boolean
  supported_only?: boolean
}

export interface FunctionCallingRecord {
  provider_id: string
  provider_name: string
  model_id: string
  tool_call_supported: boolean
  parallel_calls_supported: boolean
  max_tools_per_request: number | null
  forced_tool_call_supported: boolean
  tool_choice_options: string[]
  notes: string | null
}

export interface FunctionCallingResponse {
  function_calling: FunctionCallingRecord[]
  meta: { total: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/deprecations ────────────────────────────────────────────────────

export type DeprecationStatus = 'active' | 'warning' | 'deprecated' | 'sunset'

export interface DeprecationsParams {
  provider?: string
  status?: DeprecationStatus
}

export interface DeprecationRecord {
  provider_id: string
  model_id: string
  model_name: string
  status: DeprecationStatus
  deprecation_announced: string | null
  deprecation_date: string | null
  sunset_date: string | null
  replacement_model_id: string | null
  replacement_model_name: string | null
  migration_url: string | null
  notes: string | null
}

export interface DeprecationsResponse {
  deprecations: DeprecationRecord[]
  summary: { active: number; warning: number; deprecated: number; sunset: number }
  meta: { total: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/prompt-caching ──────────────────────────────────────────────────

export interface PromptCachingParams {
  provider?: string
  supported_only?: boolean
}

export interface PromptCachingRecord {
  provider_id: string
  provider_name: string
  caching_supported: boolean
  caching_type: 'automatic' | 'explicit' | 'none'
  cache_ttl_seconds: number | null
  cache_ttl_minutes: number | null
  cached_input_price_per_mtoken: number | null
  uncached_input_price_per_mtoken: number | null
  min_cacheable_tokens: number | null
  models_supported: string[]
  savings_pct: number | null
  notes: string | null
}

export interface PromptCachingResponse {
  prompt_caching: PromptCachingRecord[]
  meta: { total: number; supported_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/openai-compat ───────────────────────────────────────────────────

export interface OpenAICompatParams {
  provider?: string
  compatible_only?: boolean
  drop_in_only?: boolean
}

export interface OpenAICompatRecord {
  provider_id: string
  provider_name: string
  openai_compatible: boolean
  base_url: string | null
  compatible_endpoints: string[]
  known_quirks: string[]
  drop_in_replacement: boolean
  last_verified: string
}

export interface OpenAICompatResponse {
  openai_compat: OpenAICompatRecord[]
  meta: { total: number; compatible_count: number; drop_in_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/logprob-support ─────────────────────────────────────────────────

export interface LogprobSupportParams {
  provider?: string
  supported_only?: boolean
}

export interface LogprobRecord {
  provider_id: string
  provider_name: string
  model_id: string
  logprob_supported: boolean
  max_top_logprobs: number | null
  implementation_notes: string | null
  docs_url: string | null
}

export interface LogprobSupportResponse {
  logprob_support: LogprobRecord[]
  meta: { total: number; supported_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/max-output-tokens ───────────────────────────────────────────────

export interface MaxOutputTokensParams {
  provider?: string
  min_output?: number
  task?: string
  limit?: number
}

export interface MaxOutputTokenRecord {
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  task: string
  max_output_tokens: number
  context_window: number | null
  output_to_context_ratio: number | null
  notes: string | null
}

export interface MaxOutputTokensResponse {
  max_output_tokens: MaxOutputTokenRecord[]
  meta: { total: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/batch-api ───────────────────────────────────────────────────────

export interface BatchAPIParams {
  provider?: string
  available_only?: boolean
}

export interface BatchAPIRecord {
  provider_id: string
  provider_name: string
  batch_api_available: boolean
  discount_pct: number | null
  max_requests_per_batch: number | null
  max_input_tokens_per_job: number | null
  typical_turnaround_min_hours: number | null
  typical_turnaround_max_hours: number | null
  batch_endpoint: string | null
  supported_endpoints: string[]
  notes: string | null
}

export interface BatchAPIResponse {
  batch_api: BatchAPIRecord[]
  meta: { total: number; available_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/fine-tuning ─────────────────────────────────────────────────────

export interface FineTuningParams {
  provider?: string
  available_only?: boolean
  method?: string
}

export interface FineTuningRecord {
  provider_id: string
  provider_name: string
  available: boolean
  supported_models: string[]
  methods: string[]
  min_examples: number | null
  cost_per_1k_tokens_training: number | null
  storage_cost_per_model_per_month: number | null
  data_retention_days: number | null
  regions: string[]
  notes: string | null
}

export interface FineTuningResponse {
  fine_tuning: FineTuningRecord[]
  meta: { total: number; available_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/overflow-behaviour ──────────────────────────────────────────────

export type OverflowBehaviour = 'error' | 'truncate' | 'sliding_window'

export interface OverflowBehaviourParams {
  provider?: string
  behaviour?: OverflowBehaviour
}

export interface OverflowBehaviourRecord {
  provider_id: string
  provider_name: string
  model_id: string
  context_window: number | null
  overflow_behaviour: OverflowBehaviour
  truncation_side: 'start' | 'end' | null
  warning_provided: boolean
  warning_mechanism: 'header' | 'response_field' | 'error_message' | 'none'
  last_verified: string
  notes: string | null
}

export interface OverflowBehaviourResponse {
  overflow_behaviour: OverflowBehaviourRecord[]
  summary: { error: number; truncate: number; sliding_window: number; silent_truncators: string[] }
  meta: { total: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/data-retention ──────────────────────────────────────────────────

export interface DataRetentionParams {
  provider?: string
  zdr_available?: boolean
  no_training?: boolean
}

export interface DataRetentionRecord {
  provider_id: string
  provider_name: string
  prompts_logged: boolean | null
  retention_days: number | null
  opt_out_available: boolean
  opt_out_method: string | null
  trained_on_api_data: boolean | null
  zero_data_retention_available: boolean
  zero_data_retention_requires_enterprise: boolean
  policy_url: string | null
  last_verified: string
}

export interface DataRetentionResponse {
  data_retention: DataRetentionRecord[]
  meta: { total: number; zdr_available_count: number; trains_on_data_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/compliance ──────────────────────────────────────────────────────

export interface ComplianceParams {
  provider?: string
  certification?: 'soc2' | 'hipaa' | 'iso27001' | 'gdpr' | 'pci-dss' | 'fedramp'
  hipaa?: boolean
  gdpr?: boolean
}

export interface ComplianceRecord {
  provider_id: string
  provider_name: string
  certifications: string[]
  gdpr_compliant: boolean
  gdpr_dpa_available: boolean
  hipaa_baa_available: boolean
  data_residency_regions: string[]
  soc2_type: 'I' | 'II' | null
  iso27001: boolean
  pci_dss: boolean
  last_verified: string
  compliance_url: string | null
}

export interface ComplianceResponse {
  compliance: ComplianceRecord[]
  meta: { total: number; gdpr_compliant_count: number; hipaa_baa_count: number; soc2_ii_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/resolve-alias ───────────────────────────────────────────────────

export interface ResolveAliasParams {
  alias?: string
  provider?: string
}

export interface AliasRecord {
  alias: string
  provider_id: string
  provider_name: string
  resolved_model_id: string
  resolved_model_name: string
  pinned_since: string | null
  auto_updates: boolean
  notes: string | null
}

export interface ResolveAliasResponse {
  aliases?: AliasRecord[]
  meta?: { total: number; auto_updating_count: number; filters: Record<string, unknown>; note: string; data_date: string }
  // Single alias lookup returns the record directly
  alias?: string
  provider_id?: string
  resolved_model_id?: string
}

// ─── /api/v1/embedding-quality ───────────────────────────────────────────────

export type EmbeddingTaskType = 'retrieval' | 'clustering' | 'reranking' | 'sts'

export interface EmbeddingQualityParams {
  provider?: string
  task_type?: EmbeddingTaskType
  min_score?: number
  limit?: number
}

export interface EmbeddingQualityRecord {
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  task_type: EmbeddingTaskType
  mteb_score: number
  mteb_rank: number | null
  embedding_dimensions: number | null
  max_tokens: number | null
  price_per_1m_tokens: number | null
  notes: string | null
}

export interface EmbeddingQualityResponse {
  embedding_quality: EmbeddingQualityRecord[]
  meta: { total: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/sla ─────────────────────────────────────────────────────────────

export interface SLAParams {
  provider?: string
  sla_available_only?: boolean
  min_uptime?: number
}

export interface SLARecord {
  provider_id: string
  provider_name: string
  sla_available: boolean
  guaranteed_uptime_pct: number | null
  sla_tier_required: 'free' | 'paid' | 'enterprise' | null
  credit_terms: string | null
  free_tier_sla: boolean
  measurement_window: string | null
  sla_url: string | null
  last_verified: string
}

export interface SLAResponse {
  sla: SLARecord[]
  meta: { total: number; sla_available_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/reranking ───────────────────────────────────────────────────────

export interface RerankingParams {
  provider?: string
  available_only?: boolean
  multilingual_only?: boolean
}

export interface RerankingRecord {
  provider_id: string
  provider_name: string
  reranking_available: boolean
  model_id: string | null
  model_name: string | null
  price_per_1k_queries: number | null
  max_documents_per_query: number | null
  endpoint_url: string | null
  supports_multilingual: boolean
  notes: string | null
}

export interface RerankingResponse {
  reranking: RerankingRecord[]
  meta: { total: number; available_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}

// ─── /api/v1/audio-pricing ───────────────────────────────────────────────────

export type AudioType = 'stt' | 'tts' | 'both'

export interface AudioPricingParams {
  provider?: string
  type?: AudioType
  realtime_only?: boolean
  free_only?: boolean
}

export interface AudioPricingRecord {
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  type: 'stt' | 'tts'
  price_per_minute: number | null
  price_per_1k_chars: number | null
  free_tier: string | null
  min_billing_increment_seconds: number | null
  supported_formats: string[]
  realtime_supported: boolean
  notes: string | null
}

export interface AudioPricingResponse {
  audio_pricing: AudioPricingRecord[]
  meta: { total: number; stt_count: number; tts_count: number; realtime_count: number; filters: Record<string, unknown>; note: string; data_date: string }
}
