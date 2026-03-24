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

// ─── /api/v1/attest (POST) ───────────────────────────────────────────────────

export interface AttestParams {
  provider: string
  model: string
  output?: string
  payloadHash?: string
  agentId?: string
  metadata?: Record<string, unknown>
}

export interface AttestResponse {
  attestation_id: string
  provider: string
  model: string
  payload_hash: string
  agent_id: string | null
  attested_at: string
  verify_url: string
  note: string
}

// ─── /api/v1/handoff (POST) ──────────────────────────────────────────────────

export interface HandoffParams {
  fromAgent: string
  toAgent: string
  taskId?: string
  context?: string
  contextHash?: string
  metadata?: Record<string, unknown>
}

export interface HandoffResponse {
  handoff_id: string
  from_agent: string
  to_agent: string
  task_id: string | null
  context_hash: string | null
  handed_off_at: string
  verify_url: string
  note: string
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

// ─── /api/v1/json-mode ───────────────────────────────────────────────────────

export interface JsonModeParams {
  provider?: string
  model?: string
  schemaEnforcementOnly?: boolean
  jsonModeOnly?: boolean
}

export interface JsonModeRecord {
  provider_id: string
  provider_name: string
  model_id: string
  json_object_supported: boolean
  schema_enforcement_supported: boolean
  strict_mode_supported: boolean
  enforcement_method: string | null
  workaround_required: boolean
  notes: string | null
  docs_url: string | null
}

export interface JsonModeResponse {
  json_mode: JsonModeRecord[]
  meta: { total: number; schema_enforcement_count: number; json_object_count: number; no_native_support_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/streaming-latency ───────────────────────────────────────────────

export interface StreamingLatencyParams {
  provider?: string
  model?: string
  sort?: 'ttft' | 'tpt'
}

export interface StreamingLatencyRecord {
  provider_id: string
  provider_name: string
  model_id: string
  model_name: string
  median_ttft_ms: number | null
  p90_ttft_ms: number | null
  median_tpt_ms: number | null
  throughput_tokens_per_sec: number | null
  benchmark_source: string | null
  measured_at: string | null
  notes: string | null
}

export interface StreamingLatencyResponse {
  streaming_latency: StreamingLatencyRecord[]
  meta: { total: number; data_type: string; sort: string; note: string; benchmark_source: string; data_date: string }
}

// ─── /api/v1/model-versions ──────────────────────────────────────────────────

export interface ModelVersionsParams {
  provider?: string
  model?: string
  pinnableOnly?: boolean
  hasBreakingChanges?: boolean
}

export interface ModelVersionRecord {
  provider_id: string
  provider_name: string
  alias: string
  alias_auto_updates: boolean
  current_pinned_version: string | null
  pinnable: boolean
  versions: { version_id: string; released_at: string | null; notes: string | null }[]
  breaking_changes: { version_id: string; description: string }[]
  lifecycle_policy_url: string | null
}

export interface ModelVersionsResponse {
  model_versions: ModelVersionRecord[]
  meta: { total: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/websocket-support ───────────────────────────────────────────────

export interface WebSocketSupportParams {
  provider?: string
  websocketOnly?: boolean
  category?: 'llm' | 'tts' | 'stt'
}

export interface WebSocketSupportRecord {
  provider_id: string
  provider_name: string
  websocket_supported: boolean
  streaming_method: string
  also_supports_sse: boolean
  use_case: string
  websocket_endpoint: string | null
  supported_models: string[]
  auth_method: string | null
  multiplexing_supported: boolean
  notes: string | null
  docs_url: string | null
}

export interface WebSocketSupportResponse {
  websocket_support: WebSocketSupportRecord[]
  meta: { total: number; websocket_count: number; sse_only_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/task-cost ───────────────────────────────────────────────────────

export type TaskCostType = 'chat' | 'embedding' | 'image' | 'audio' | 'search'

export interface TaskCostParams {
  taskType: TaskCostType
  inputTokens?: number
  outputTokens?: number
  cachedTokens?: number
  limit?: number
  freeOnly?: boolean
}

export interface TaskCostProvider {
  rank: number
  provider_id: string
  provider_name: string
  model: string
  estimated_cost_usd: number
  input_cost_usd: number
  output_cost_usd: number
  input_per_1m_usd: number | null
  output_per_1m_usd: number | null
  pct_more_expensive_than_cheapest: number
  free_tier: boolean
  pricing_url: string | null
}

export interface TaskCostResponse {
  task_type: TaskCostType
  input_tokens: number
  output_tokens: number
  cached_tokens: number
  providers_ranked: TaskCostProvider[]
  meta: { total: number; showing: number; cheapest_provider: string | null; most_expensive_provider: string | null; price_range_usd: { min: number; max: number } | null; note: string; data_date: string }
}

// ─── /api/v1/caching-granularity ─────────────────────────────────────────────

export interface CachingGranularityParams {
  provider?: string
  supportsCaching?: boolean
}

export interface CachingGranularityRecord {
  provider_id: string
  provider_name: string
  caching_supported: boolean
  caching_type: string | null
  cacheable_elements: string[]
  elements_cache_independently: boolean
  min_tokens_per_block: number | null
  max_cache_breakpoints: number | null
  ttl_options_seconds: number[]
  default_ttl_seconds: number | null
  cached_price_pct_of_input: number | null
  requires_explicit_markup: boolean
  markup_method: string | null
  notes: string | null
  docs_url: string | null
}

export interface CachingGranularityResponse {
  caching_granularity: CachingGranularityRecord[]
  meta: { total: number; caching_supported_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/free-tier ───────────────────────────────────────────────────────

export interface FreeTierParams {
  provider?: string
  permanentOnly?: boolean
  hasFreeTier?: boolean
}

export interface FreeTierRecord {
  provider_id: string
  provider_name: string
  has_free_tier: boolean
  tier_type: 'permanent' | 'trial_credit' | 'none'
  requires_credit_card: boolean
  included_models: string[]
  monthly_token_cap: number | null
  monthly_request_cap: number | null
  daily_request_cap: number | null
  trial_credit_usd: number | null
  trial_credit_recurring: boolean
  rate_limits_apply: boolean
  rate_limits_url: string | null
  changelog: { date: string; change: string }[]
  notes: string | null
  docs_url: string | null
}

export interface FreeTierResponse {
  free_tiers: FreeTierRecord[]
  meta: { total: number; permanent_free_count: number; trial_credit_count: number; no_free_access_count: number; see_also: string; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/error-codes ─────────────────────────────────────────────────────

export interface ErrorCodesParams {
  provider?: string
  category?: string
  retryableOnly?: boolean
  httpStatus?: number
}

export interface ErrorCodeRecord {
  provider_id: string
  provider_name: string
  http_status: number
  provider_error_type: string | null
  provider_error_code: string | null
  standard_category: string
  retryable: boolean
  recommended_backoff_ms: number | null
  max_retries: number | null
  resolution: string | null
  notes: string | null
}

export interface ErrorCodesResponse {
  error_codes: ErrorCodeRecord[]
  meta: { total: number; categories: string[]; retryable_count: number; non_retryable_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/rate-limit-recovery ─────────────────────────────────────────────

export interface RateLimitRecoveryParams {
  provider?: string
}

export interface RateLimitRecoveryRecord {
  provider_id: string
  provider_name: string
  retry_after_header: string | null
  retry_after_format: string | null
  reset_headers: string[]
  reset_header_format: string | null
  rpm_window_type: string | null
  tpm_window_type: string | null
  recommended_strategy: string
  base_delay_ms: number | null
  max_delay_ms: number | null
  jitter: boolean
  notes: string | null
  docs_url: string | null
}

export interface RateLimitRecoveryResponse {
  rate_limit_recovery: RateLimitRecoveryRecord[]
  meta: { total: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/regions ─────────────────────────────────────────────────────────

export interface RegionsParams {
  provider?: string
  region?: string
  model?: string
  euOnly?: boolean
}

export interface InferenceRegion {
  region_id: string
  region_name: string
  cloud: string | null
  models: string[] | null
}

export interface RegionsRecord {
  provider_id: string
  provider_name: string
  inference_regions: InferenceRegion[]
  geographies: string[]
  eu_available: boolean
  notes: string | null
  docs_url: string | null
}

export interface RegionsResponse {
  regions: RegionsRecord[]
  meta: { total: number; eu_available_count: number; us_available_count: number; ap_available_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/uptime-history ──────────────────────────────────────────────────

export interface UptimeHistoryParams {
  provider: string
  period?: '7d' | '30d' | '90d'
}

export interface UptimeDayRecord {
  date: string
  uptime_pct: number
  total_checks: number
  outage_checks: number
}

export interface UptimeHistoryResponse {
  provider: string
  provider_name: string
  period: string
  granularity: string
  overall_uptime_pct: number | null
  sla_target: number | null
  sla_met: boolean | null
  timeline: UptimeDayRecord[]
  incidents_in_period: number
  meta: { period_days: number; data_from: string | null; data_to: string | null; note: string }
}

// ─── /api/v1/context-window ──────────────────────────────────────────────────

export interface ContextWindowParams {
  provider?: string
  model?: string
  minContext?: number
  effectiveOnly?: boolean
}

export interface ContextWindowRecord {
  provider_id: string
  provider_name: string
  model_id: string
  advertised_context: number
  effective_context: number | null
  recommended_max_fill: number | null
  usable_tokens: number | null
  shared_context: boolean
  degradation_note: string | null
  notes: string | null
  docs_url: string | null
}

export interface ContextWindowResponse {
  context_windows: ContextWindowRecord[]
  meta: { total: number; largest_advertised: number; largest_effective: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/thinking-support ────────────────────────────────────────────────

export interface ThinkingSupportParams {
  provider?: string
  model?: string
  supportedOnly?: boolean
  visibleThinking?: boolean
  budgetConfigurable?: boolean
}

export interface ThinkingSupportRecord {
  provider_id: string
  provider_name: string
  model_id: string
  thinking_supported: boolean
  thinking_visible: boolean
  thinking_param: string | null
  thinking_pricing: string | null
  thinking_cost_per_1m: number | null
  budget_configurable: boolean
  budget_param: string | null
  default_behavior: string | null
  notes: string | null
  docs_url: string | null
}

export interface ThinkingSupportResponse {
  thinking_support: ThinkingSupportRecord[]
  meta: { total: number; thinking_capable: number; visible_thinking: number; budget_configurable: number; always_on: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/multimodal ──────────────────────────────────────────────────────

export interface MultimodalParams {
  provider?: string
  model?: string
  inputType?: 'text' | 'image' | 'audio' | 'video' | 'pdf'
  outputType?: 'text' | 'image' | 'audio'
}

export interface MultimodalRecord {
  provider_id: string
  provider_name: string
  model_id: string
  inputs: string[]
  outputs: string[]
  max_images: number | null
  max_image_size_mb: number | null
  supported_image_formats: string[]
  notes: string | null
  docs_url: string | null
}

export interface MultimodalResponse {
  multimodal: MultimodalRecord[]
  meta: { total: number; vision_capable: number; audio_input: number; video_input: number; pdf_input: number; image_output: number; audio_output: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/structured-output ───────────────────────────────────────────────

export interface StructuredOutputParams {
  provider?: string
  model?: string
  strictOnly?: boolean
  constrainedDecoding?: boolean
  schemaSupported?: boolean
}

export interface StructuredOutputRecord {
  provider_id: string
  provider_name: string
  model_id: string
  json_schema_supported: boolean
  strict_enforcement: boolean
  constrained_decoding: boolean
  response_format_param: string | null
  max_schema_depth: number | null
  supported_schema_features: string[]
  failure_mode: string | null
  notes: string | null
  docs_url: string | null
}

export interface StructuredOutputResponse {
  structured_output: StructuredOutputRecord[]
  meta: { total: number; schema_supported: number; strict_enforcement: number; constrained_decoding: number; no_structured_output: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/token-estimate (POST) ───────────────────────────────────────────

export interface TokenEstimateParams {
  text: string
  provider?: string
  model?: string
}

export interface TokenizerEstimate {
  tokenizer: string
  tokenizer_name: string
  estimated_tokens: number
  providers: string[]
}

export interface SingleProviderTokenEstimate {
  provider_id: string
  provider_name: string
  model: string | null
  tokenizer: string
  estimated_tokens: number
  confidence: string
  margin_of_error: string
  token_range: { low: number; high: number }
}

export interface TokenEstimateResponse {
  // Multi-tokenizer response (no provider specified)
  estimates?: TokenizerEstimate[]
  summary?: { min_tokens: number; max_tokens: number; avg_tokens: number }
  // Single provider response
  estimate?: SingleProviderTokenEstimate
  input: { char_count: number; word_count: number }
  meta: { method: string; confidence?: string; margin_of_error?: string; note: string; max_input_chars?: number; data_date: string }
}

// ─── /api/v1/cost-forecast ───────────────────────────────────────────────────

export interface CostForecastParams {
  provider?: string
  task?: string
  requestsPerDay?: number
  avgInputTokens?: number
  avgOutputTokens?: number
  cacheHitRate?: number
  limit?: number
}

export interface CostForecastRecord {
  provider_id: string
  provider_name: string
  model: string
  daily_cost: number
  weekly_cost: number
  monthly_cost: number
  yearly_cost: number
  cost_breakdown: { daily_input_cost: number; daily_output_cost: number; cache_savings_per_day: number }
  pricing: { input_per_1m: number; output_per_1m: number; caching_available: boolean }
}

export interface CostForecastResponse {
  forecasts: CostForecastRecord[]
  usage_profile: { task: string; requests_per_day: number; avg_input_tokens: number; avg_output_tokens: number; cache_hit_rate: number; daily_total_tokens: number; monthly_total_tokens: number }
  meta: { total: number; cheapest_daily: number | null; cheapest_provider: string | null; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/guardrails ──────────────────────────────────────────────────────

export interface GuardrailsParams {
  provider?: string
  configurableOnly?: boolean
  canDisable?: boolean
  category?: string
}

export interface GuardrailsRecord {
  provider_id: string
  provider_name: string
  safety_filters_enabled: boolean
  configurable: boolean
  filter_categories: string[]
  strictness_levels: string[]
  can_disable: boolean
  false_positive_risk: 'low' | 'medium' | 'high' | null
  content_policy_url: string | null
  notes: string | null
}

export interface GuardrailsResponse {
  guardrails: GuardrailsRecord[]
  meta: { total: number; filters_enabled: number; configurable: number; can_disable: number; no_filters: number; high_false_positive: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/rate-limit-status ───────────────────────────────────────────────

export interface RateLimitStatusParams {
  provider?: string
}

export interface RateLimitStatusRecord {
  provider_id: string
  provider_name: string
  congestion: 'low' | 'moderate' | 'high' | 'critical'
  avg_response_time_ms: number | null
  p95_response_time_ms: number | null
  response_time_trend: number
  error_rate_1h: number
  samples_1h: number
  published_limits: { rpm: number | null; tpm: number | null; tier: string } | null
  recommendation: string
  last_checked: string | null
}

export interface RateLimitStatusResponse {
  rate_limit_status: RateLimitStatusRecord[]
  meta: { total: number; critical: number; high: number; moderate: number; low: number; window: string; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/migration-guide ─────────────────────────────────────────────────

export interface MigrationGuideParams {
  from?: string
  to?: string
  maxDifficulty?: 'drop_in' | 'easy' | 'moderate' | 'hard'
  dropInOnly?: boolean
}

export interface MigrationGuideRecord {
  from_provider: string
  from_provider_name: string
  to_provider: string
  to_provider_name: string
  difficulty: 'drop_in' | 'easy' | 'moderate' | 'hard'
  openai_compat: boolean
  param_changes: { param: string; from_value: string; to_value: string }[]
  missing_features: string[]
  response_format_changes: string[]
  auth_change: string | null
  gotchas: string[]
  notes: string | null
}

export interface MigrationGuideResponse {
  migration_guides: MigrationGuideRecord[]
  meta: { total: number; drop_in_count: number; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/sdk-support ─────────────────────────────────────────────────────

export interface SdkSupportParams {
  provider?: string
  language?: string
  officialOnly?: boolean
  openaiCompatOnly?: boolean
}

export interface SdkRecord {
  language: string
  official: boolean
  package_name: string | null
  repo_url: string | null
  openai_compat: boolean
  notes: string | null
}

export interface SdkSupportRecord {
  provider_id: string
  provider_name: string
  openai_compat_sdk: boolean
  sdk_count: number
  languages: string[]
  sdks: SdkRecord[]
  notes: string | null
}

export interface SdkSupportResponse {
  sdk_support: SdkSupportRecord[]
  meta: { total: number; openai_compat_count: number; available_languages: string[]; filters: Record<string, unknown>; data_date: string }
}

// ─── /api/v1/changelog/api ───────────────────────────────────────────────────

export type ApiChangeType = 'new_model' | 'deprecation' | 'pricing_change' | 'feature_added' | 'feature_removed' | 'breaking_change' | 'rate_limit_change'
export type ApiChangeImpact = 'high' | 'medium' | 'low'

export interface ApiChangelogParams {
  provider?: string
  type?: ApiChangeType
  impact?: ApiChangeImpact
  days?: number
  limit?: number
}

export interface ApiChangelogEntry {
  date: string
  provider_id: string
  provider_name: string
  change_type: ApiChangeType
  title: string
  description: string
  impact: ApiChangeImpact
  affected_models: string[]
  source_url: string | null
}

export interface ApiChangelogResponse {
  changelog: ApiChangelogEntry[]
  meta: {
    total: number
    period_days: number
    by_type: { new_model: number; deprecation: number; pricing_change: number; feature_added: number; breaking_change: number; rate_limit_change: number }
    by_impact: { high: number; medium: number; low: number }
    filters: Record<string, unknown>
    data_date: string
  }
}
