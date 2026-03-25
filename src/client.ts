import type {
  TopNetworksOptions,
  TopNetworksErrorData,
  HealthResponse,
  HealthPremiumResponse,
  FreshnessParams,
  FreshnessResponse,
  LatencyParams,
  LatencyResponse,
  IncidentsParams,
  IncidentsResponse,
  ChangelogParams,
  ChangelogResponse,
  PickParams,
  PickResponse,
  FailoverParams,
  FailoverResponse,
  RecommendParams,
  RecommendResponse,
  CompareParams,
  CompareResponse,
  CheapestParams,
  CheapestResponse,
  CostEstimateParams,
  CostEstimateResponse,
  PricingParams,
  PricingResponse,
  ModelsParams,
  ModelsResponse,
  RateLimitsParams,
  RateLimitsResponse,
  BenchmarksParams,
  BenchmarksResponse,
  QuotaCheckParams,
  QuotaCheckResponse,
  AttestParams,
  AttestResponse,
  HandoffParams,
  HandoffResponse,
  McpResponse,
  WebhookSubscribeParams,
  WebhookSubscribeResponse,
  WebhookStatusResponse,
  WebhookDeleteResponse,
  FunctionCallingParams,
  FunctionCallingResponse,
  DeprecationsParams,
  DeprecationsResponse,
  PromptCachingParams,
  PromptCachingResponse,
  OpenAICompatParams,
  OpenAICompatResponse,
  LogprobSupportParams,
  LogprobSupportResponse,
  MaxOutputTokensParams,
  MaxOutputTokensResponse,
  BatchAPIParams,
  BatchAPIResponse,
  FineTuningParams,
  FineTuningResponse,
  OverflowBehaviourParams,
  OverflowBehaviourResponse,
  DataRetentionParams,
  DataRetentionResponse,
  ComplianceParams,
  ComplianceResponse,
  ResolveAliasParams,
  ResolveAliasResponse,
  EmbeddingQualityParams,
  EmbeddingQualityResponse,
  SLAParams,
  SLAResponse,
  RerankingParams,
  RerankingResponse,
  AudioPricingParams,
  AudioPricingResponse,
  JsonModeParams,
  JsonModeResponse,
  StreamingLatencyParams,
  StreamingLatencyResponse,
  ModelVersionsParams,
  ModelVersionsResponse,
  WebSocketSupportParams,
  WebSocketSupportResponse,
  TaskCostParams,
  TaskCostResponse,
  CachingGranularityParams,
  CachingGranularityResponse,
  FreeTierParams,
  FreeTierResponse,
  ErrorCodesParams,
  ErrorCodesResponse,
  RateLimitRecoveryParams,
  RateLimitRecoveryResponse,
  RegionsParams,
  RegionsResponse,
  UptimeHistoryParams,
  UptimeHistoryResponse,
  ContextWindowParams,
  ContextWindowResponse,
  ThinkingSupportParams,
  ThinkingSupportResponse,
  MultimodalParams,
  MultimodalResponse,
  StructuredOutputParams,
  StructuredOutputResponse,
  TokenEstimateParams,
  TokenEstimateResponse,
  CostForecastParams,
  CostForecastResponse,
  GuardrailsParams,
  GuardrailsResponse,
  RateLimitStatusParams,
  RateLimitStatusResponse,
  MigrationGuideParams,
  MigrationGuideResponse,
  SdkSupportParams,
  SdkSupportResponse,
  ApiChangelogParams,
  ApiChangelogResponse,
  AgentProtocolsParams,
  AgentProtocolsResponse,
  KnowledgeCutoffParams,
  KnowledgeCutoffResponse,
  ToolCallFormatParams,
  ToolCallFormatResponse,
  StreamingProtocolsParams,
  StreamingProtocolsResponse,
  OutputReproducibilityParams,
  OutputReproducibilityResponse,
  NativeToolsParams,
  NativeToolsResponse,
  ModelTaskFitParams,
  ModelTaskFitResponse,
  PiiHandlingParams,
  PiiHandlingResponse,
  ContextCompressionParams,
  ContextCompressionResponse,
  SecurityCertificationsParams,
  SecurityCertificationsResponse,
  SemanticCachingParams,
  SemanticCachingResponse,
  McpSupportParams,
  McpSupportResponse,
  ModelLifecycleParams,
  ModelLifecycleResponse,
  DelegationSupportParams,
  DelegationSupportResponse,
  PromptModerationParams,
  PromptModerationResponse,
} from './types.js'

const DEFAULT_BASE_URL = 'https://topnetworks.com'
const DEFAULT_TIMEOUT = 30_000

// ─── Error Class ─────────────────────────────────────────────────────────────

export class TopNetworksError extends Error {
  readonly status: number
  readonly statusText: string
  readonly body: unknown

  constructor(message: string, data: TopNetworksErrorData) {
    super(message)
    this.name = 'TopNetworksError'
    this.status = data.status
    this.statusText = data.statusText
    this.body = data.body
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toQuery(params: Record<string, unknown> | object): string {
  const parts: string[] = []
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue
    if (Array.isArray(val)) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val.join(','))}`)
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
    }
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

function snakeCase(key: string): string {
  return key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)
}

function toSnakeParams(params: object): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(params)) {
    out[snakeCase(key)] = val
  }
  return out
}

// ─── Client ──────────────────────────────────────────────────────────────────

export class TopNetworks {
  private readonly baseUrl: string
  private readonly _fetch: typeof globalThis.fetch
  private readonly timeout: number
  private readonly headers: Record<string, string>

  constructor(options: TopNetworksOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
    this._fetch = options.fetch ?? globalThis.fetch
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT
    this.headers = options.headers ?? {}
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  private async get<T>(path: string, params: object = {}): Promise<T> {
    const url = `${this.baseUrl}${path}${toQuery(params)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await this._fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', ...this.headers },
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => res.statusText)
        throw new TopNetworksError(
          `TopNetworks API error: ${res.status} ${res.statusText}`,
          { status: res.status, statusText: res.statusText, body },
        )
      }

      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  private async post<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await this._fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...this.headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!res.ok) {
        const resBody = await res.json().catch(() => res.statusText)
        throw new TopNetworksError(
          `TopNetworks API error: ${res.status} ${res.statusText}`,
          { status: res.status, statusText: res.statusText, body: resBody },
        )
      }

      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  private async del<T>(path: string, params: object = {}): Promise<T> {
    const url = `${this.baseUrl}${path}${toQuery(params)}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await this._fetch(url, {
        method: 'DELETE',
        headers: { Accept: 'application/json', ...this.headers },
        signal: controller.signal,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => res.statusText)
        throw new TopNetworksError(
          `TopNetworks API error: ${res.status} ${res.statusText}`,
          { status: res.status, statusText: res.statusText, body },
        )
      }

      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  // ── Live Status ──────────────────────────────────────────────────────────

  /** Live status for all 52+ providers. */
  async health(): Promise<HealthResponse> {
    return this.get('/api/v1/health')
  }

  /** Enhanced health analytics — requires x402 payment. */
  async healthPremium(): Promise<HealthPremiumResponse> {
    return this.get('/api/v1/health/premium')
  }

  /** Data freshness and drift score for a provider. */
  async freshness(params: FreshnessParams): Promise<FreshnessResponse> {
    return this.get('/api/v1/freshness', params)
  }

  /** Latency percentiles (p50/p95/p99) with TTFT estimate. */
  async latency(params: LatencyParams): Promise<LatencyResponse> {
    return this.get('/api/v1/latency', params)
  }

  /** De-duplicated incident feed. */
  async incidents(params: IncidentsParams = {}): Promise<IncidentsResponse> {
    return this.get('/api/v1/incidents', params)
  }

  /** Status change feed — infrastructure RSS for AI providers. */
  async changelog(params: ChangelogParams = {}): Promise<ChangelogResponse> {
    return this.get('/api/v1/changelog', params)
  }

  // ── Decision Tools ───────────────────────────────────────────────────────

  /** Smart single-call provider selection. One call to rule them all. */
  async pick(params: PickParams): Promise<PickResponse> {
    return this.get('/api/v1/pick', toSnakeParams(params))
  }

  /** Ordered failover chain when your primary provider fails. */
  async failover(params: FailoverParams): Promise<FailoverResponse> {
    return this.get('/api/v1/failover', toSnakeParams({
      ...params,
      maxCostPer1m: params.maxCostPer1m,
    }))
  }

  /** Ranked provider recommendations by task type. */
  async recommend(params: RecommendParams = {}): Promise<RecommendResponse> {
    return this.get('/api/v1/recommend', toSnakeParams(params))
  }

  /** Head-to-head comparison of 2-10 providers. */
  async compare(params: CompareParams): Promise<CompareResponse> {
    return this.get('/api/v1/compare', toSnakeParams(params))
  }

  /** Find the cheapest operational provider with optional quality floor. */
  async cheapest(params: CheapestParams): Promise<CheapestResponse> {
    return this.get('/api/v1/cheapest', toSnakeParams({
      ...params,
      minQuality: params.minQuality,
    }))
  }

  /** Pre-flight token cost estimation with cache breakdown. */
  async costEstimate(params: CostEstimateParams): Promise<CostEstimateResponse> {
    return this.get('/api/v1/cost-estimate', toSnakeParams(params))
  }

  // ── Provider Data ────────────────────────────────────────────────────────

  /** Unified pricing across all providers. */
  async pricing(params: PricingParams = {}): Promise<PricingResponse> {
    return this.get('/api/v1/pricing', toSnakeParams(params))
  }

  /** Model capability registry — context windows, vision, function calling. */
  async models(params: ModelsParams = {}): Promise<ModelsResponse> {
    return this.get('/api/v1/models', toSnakeParams(params))
  }

  /** Published rate limits per provider and tier. */
  async rateLimits(params: RateLimitsParams = {}): Promise<RateLimitsResponse> {
    return this.get('/api/v1/rate-limits', toSnakeParams(params))
  }

  /** Public benchmark scores — MMLU, HumanEval, MATH, GPQA, MGSM. */
  async benchmarks(params: BenchmarksParams = {}): Promise<BenchmarksResponse> {
    return this.get('/api/v1/benchmarks', toSnakeParams(params))
  }

  /** Rate limit feasibility check for planned usage. */
  async quotaCheck(params: QuotaCheckParams): Promise<QuotaCheckResponse> {
    return this.get('/api/v1/quota-check', toSnakeParams(params))
  }

  // ── Trust & Identity ─────────────────────────────────────────────────────

  /** Attest that a specific output was produced by a specific model. */
  async attest(params: AttestParams): Promise<AttestResponse> {
    return this.post('/api/v1/attest', {
      provider: params.provider,
      model: params.model,
      output: params.output,
      payload_hash: params.payloadHash,
      agent_id: params.agentId,
      metadata: params.metadata,
    })
  }

  /** Record an agent-to-agent task handoff for audit trail. */
  async handoff(params: HandoffParams): Promise<HandoffResponse> {
    return this.post('/api/v1/handoff', {
      from_agent: params.fromAgent,
      to_agent: params.toAgent,
      task_id: params.taskId,
      context: params.context,
      context_hash: params.contextHash,
      metadata: params.metadata,
    })
  }

  // ── Developer Tools ──────────────────────────────────────────────────────

  /** Get the full OpenAPI 3.1 specification. */
  async openapi(): Promise<Record<string, unknown>> {
    return this.get('/api/v1/openapi.json')
  }

  /** Send a JSON-RPC 2.0 request to the MCP server. */
  async mcp(method: string, params: Record<string, unknown> = {}, id: number | string = 1): Promise<McpResponse> {
    return this.post('/api/v1/mcp', {
      jsonrpc: '2.0',
      id,
      method,
      params,
    })
  }

  // ── Webhooks ─────────────────────────────────────────────────────────────

  /** Subscribe to status change webhooks. */
  async webhookSubscribe(params: WebhookSubscribeParams): Promise<WebhookSubscribeResponse> {
    return this.post('/api/v1/webhooks', {
      callback_url: params.callbackUrl,
      events: params.events,
      providers: params.providers,
      secret: params.secret,
      expires_in_hours: params.expiresInHours,
      metadata: params.metadata,
    })
  }

  /** Check webhook subscription status. */
  async webhookStatus(id: string): Promise<WebhookStatusResponse> {
    return this.get('/api/v1/webhooks', { id })
  }

  /** Delete (deactivate) a webhook subscription. */
  async webhookDelete(id: string): Promise<WebhookDeleteResponse> {
    return this.del('/api/v1/webhooks', { id })
  }
  // ── Model Intelligence ───────────────────────────────────────────────────

  /**
   * Per-provider/model function calling capabilities.
   * Includes parallel call support, max tools, forced mode, tool_choice options.
   */
  async functionCalling(params: FunctionCallingParams = {}): Promise<FunctionCallingResponse> {
    return this.get('/api/v1/function-calling', params)
  }

  /**
   * Model deprecation & sunset tracker.
   * Filter by provider or status (active|warning|deprecated|sunset).
   */
  async deprecations(params: DeprecationsParams = {}): Promise<DeprecationsResponse> {
    return this.get('/api/v1/deprecations', params)
  }

  /**
   * Max output tokens per model, sorted descending.
   * Filter by provider, minimum output tokens, or task type.
   */
  async maxOutputTokens(params: MaxOutputTokensParams = {}): Promise<MaxOutputTokensResponse> {
    return this.get('/api/v1/max-output-tokens', params)
  }

  /**
   * Log probability support per provider/model.
   * Essential for confidence scoring and uncertainty quantification.
   */
  async logprobSupport(params: LogprobSupportParams = {}): Promise<LogprobSupportResponse> {
    return this.get('/api/v1/logprob-support', params)
  }

  /**
   * MTEB benchmark scores for embedding models.
   * Filter by task_type: retrieval | clustering | reranking | sts
   */
  async embeddingQuality(params: EmbeddingQualityParams = {}): Promise<EmbeddingQualityResponse> {
    return this.get('/api/v1/embedding-quality', params)
  }

  /**
   * Resolve a model alias to its current pinned snapshot.
   * Pass alias param for single lookup, or omit for full table.
   */
  async resolveAlias(params: ResolveAliasParams = {}): Promise<ResolveAliasResponse> {
    return this.get('/api/v1/resolve-alias', params)
  }

  // ── Cost & Batch ─────────────────────────────────────────────────────────

  /**
   * Prompt caching support, TTL, and cost savings per provider.
   * Up to 90% cost reduction on repeated system prompts.
   */
  async promptCaching(params: PromptCachingParams = {}): Promise<PromptCachingResponse> {
    return this.get('/api/v1/prompt-caching', params)
  }

  /**
   * Batch API availability, discount %, and turnaround time per provider.
   * Typically 50% cheaper for non-urgent workloads.
   */
  async batchApi(params: BatchAPIParams = {}): Promise<BatchAPIResponse> {
    return this.get('/api/v1/batch-api', params)
  }

  /**
   * Fine-tuning availability, supported models, methods, and constraints.
   * Filter by provider or method (lora|full|supervised|dpo).
   */
  async fineTuning(params: FineTuningParams = {}): Promise<FineTuningResponse> {
    return this.get('/api/v1/fine-tuning', params)
  }

  /**
   * STT and TTS audio pricing comparison across providers.
   * Filter by type (stt|tts|both), realtime support, or free tier.
   */
  async audioPricing(params: AudioPricingParams = {}): Promise<AudioPricingResponse> {
    return this.get('/api/v1/audio-pricing', params)
  }

  /**
   * Reranking API availability and pricing.
   * Cohere, Voyage AI. Essential for RAG pipelines.
   */
  async reranking(params: RerankingParams = {}): Promise<RerankingResponse> {
    return this.get('/api/v1/reranking', params)
  }

  // ── Trust & Compliance ───────────────────────────────────────────────────

  /**
   * SOC2, HIPAA, ISO27001, GDPR certifications per provider.
   * Filter by specific certification, hipaa=true, or gdpr=true.
   */
  async compliance(params: ComplianceParams = {}): Promise<ComplianceResponse> {
    return this.get('/api/v1/compliance', params)
  }

  /**
   * Prompt logging policies, retention periods, and ZDR availability.
   * Filter by zdr_available=true or no_training=true.
   */
  async dataRetention(params: DataRetentionParams = {}): Promise<DataRetentionResponse> {
    return this.get('/api/v1/data-retention', params)
  }

  /**
   * Published uptime SLA guarantees per provider.
   * Note: different from observed uptime in /health/premium.
   */
  async sla(params: SLAParams = {}): Promise<SLAResponse> {
    return this.get('/api/v1/sla', params)
  }

  /**
   * Context overflow behaviour per provider/model.
   * Identifies silent truncators — a common source of agent failures.
   */
  async overflowBehaviour(params: OverflowBehaviourParams = {}): Promise<OverflowBehaviourResponse> {
    return this.get('/api/v1/overflow-behaviour', params)
  }

  /**
   * OpenAI-compatible API matrix — base URLs, compatible endpoints, quirks.
   * Use compatible_only=true or drop_in_only=true to filter.
   */
  async openaiCompat(params: OpenAICompatParams = {}): Promise<OpenAICompatResponse> {
    return this.get('/api/v1/openai-compat', params)
  }

  // ── Model Intelligence (new) ─────────────────────────────────────────────

  /**
   * JSON output mode support per provider/model.
   * json_object, strict schema enforcement, workaround requirements.
   */
  async jsonMode(params: JsonModeParams = {}): Promise<JsonModeResponse> {
    return this.get('/api/v1/json-mode', toSnakeParams(params))
  }

  /**
   * TTFT and throughput benchmarks from curated sources.
   * Sort by ttft (default) or tpt (tokens-per-second).
   */
  async streamingLatency(params: StreamingLatencyParams = {}): Promise<StreamingLatencyResponse> {
    return this.get('/api/v1/streaming-latency', params)
  }

  /**
   * Model version history and pinning.
   * Version history, release dates, breaking changes, pinnable snapshots.
   */
  async modelVersions(params: ModelVersionsParams = {}): Promise<ModelVersionsResponse> {
    return this.get('/api/v1/model-versions', toSnakeParams(params))
  }

  /**
   * WebSocket vs SSE streaming support per provider.
   * WebSocket endpoints, auth methods, multiplexing, use case.
   */
  async websocketSupport(params: WebSocketSupportParams = {}): Promise<WebSocketSupportResponse> {
    return this.get('/api/v1/websocket-support', toSnakeParams(params))
  }

  /**
   * Context window sizes — advertised vs effective (tested).
   * Includes recommended max fill percentage and degradation notes.
   */
  async contextWindow(params: ContextWindowParams = {}): Promise<ContextWindowResponse> {
    return this.get('/api/v1/context-window', toSnakeParams(params))
  }

  /**
   * Extended thinking / reasoning mode support per model.
   * Parameter names, pricing, visibility, budget configuration.
   */
  async thinkingSupport(params: ThinkingSupportParams = {}): Promise<ThinkingSupportResponse> {
    return this.get('/api/v1/thinking-support', toSnakeParams(params))
  }

  /**
   * Input/output modality matrix per model.
   * Which models accept images, audio, video, PDF; which output images or audio.
   */
  async multimodal(params: MultimodalParams = {}): Promise<MultimodalResponse> {
    return this.get('/api/v1/multimodal', toSnakeParams(params))
  }

  /**
   * Structured output / JSON schema enforcement per model.
   * Strict enforcement, constrained decoding, supported schema features.
   */
  async structuredOutput(params: StructuredOutputParams = {}): Promise<StructuredOutputResponse> {
    return this.get('/api/v1/structured-output', toSnakeParams(params))
  }

  // ── Cost & Batch (new) ───────────────────────────────────────────────────

  /**
   * Rank all providers by total cost for a task type.
   * All providers cheapest-first for a given task and token count.
   */
  async taskCost(params: TaskCostParams): Promise<TaskCostResponse> {
    return this.get('/api/v1/task-cost', toSnakeParams(params))
  }

  /**
   * Prompt caching mechanics per provider.
   * Cacheable elements, min tokens, TTL, automatic vs explicit, savings.
   */
  async cachingGranularity(params: CachingGranularityParams = {}): Promise<CachingGranularityResponse> {
    return this.get('/api/v1/caching-granularity', toSnakeParams(params))
  }

  /**
   * Free tier breakdown per provider.
   * Permanent vs trial credit, caps, included models, changelog.
   */
  async freeTier(params: FreeTierParams = {}): Promise<FreeTierResponse> {
    return this.get('/api/v1/free-tier', toSnakeParams(params))
  }

  /**
   * Estimate token count across provider tokenizers (POST).
   * ±10% accuracy. Max 50,000 characters.
   */
  async tokenEstimate(params: TokenEstimateParams): Promise<TokenEstimateResponse> {
    return this.post('/api/v1/token-estimate', {
      text: params.text,
      provider: params.provider,
      model: params.model,
    })
  }

  /**
   * Project daily/weekly/monthly costs for a usage pattern.
   * Budget planning across providers with cache savings projection.
   */
  async costForecast(params: CostForecastParams = {}): Promise<CostForecastResponse> {
    return this.get('/api/v1/cost-forecast', toSnakeParams(params))
  }

  // ── Trust & Compliance (new) ─────────────────────────────────────────────

  /**
   * Cross-provider error code taxonomy.
   * Maps native error formats to standard categories with retry guidance.
   */
  async errorCodes(params: ErrorCodesParams = {}): Promise<ErrorCodesResponse> {
    return this.get('/api/v1/error-codes', toSnakeParams(params))
  }

  /**
   * 429 recovery guide per provider.
   * Retry headers, reset window semantics, recommended backoff strategy.
   */
  async rateLimitRecovery(params: RateLimitRecoveryParams = {}): Promise<RateLimitRecoveryResponse> {
    return this.get('/api/v1/rate-limit-recovery', params)
  }

  /**
   * Inference regions per provider.
   * Geographic regions, EU availability, per-model region matrices.
   */
  async regions(params: RegionsParams = {}): Promise<RegionsResponse> {
    return this.get('/api/v1/regions', toSnakeParams(params))
  }

  /**
   * Daily uptime % timeseries — 7/30/90 day from live polling.
   * Requires provider param. Includes SLA comparison.
   */
  async uptimeHistory(params: UptimeHistoryParams): Promise<UptimeHistoryResponse> {
    return this.get('/api/v1/uptime-history', toSnakeParams(params))
  }

  /**
   * Content filtering and safety config per provider.
   * Answers "will this provider block my medical/security/research content?"
   */
  async guardrails(params: GuardrailsParams = {}): Promise<GuardrailsResponse> {
    return this.get('/api/v1/guardrails', toSnakeParams(params))
  }

  /**
   * Live congestion and rate limit pressure per provider.
   * Real-time congestion: low/moderate/high/critical from polling data.
   */
  async rateLimitStatus(params: RateLimitStatusParams = {}): Promise<RateLimitStatusResponse> {
    return this.get('/api/v1/rate-limit-status', params)
  }

  /**
   * Provider migration guide — parameter mapping and gotchas.
   * When switching from provider A to B: param changes, missing features, auth diffs.
   */
  async migrationGuide(params: MigrationGuideParams): Promise<MigrationGuideResponse> {
    return this.get('/api/v1/migration-guide', toSnakeParams(params))
  }

  // ── Developer Tools (new) ────────────────────────────────────────────────

  /**
   * Official SDK availability per provider by language.
   * Official vs community, OpenAI-compatible flag, package names and repo URLs.
   */
  async sdkSupport(params: SdkSupportParams = {}): Promise<SdkSupportResponse> {
    return this.get('/api/v1/sdk-support', toSnakeParams(params))
  }

  /**
   * Cross-provider API changelog — new models, deprecations, pricing changes.
   * Meta-changelog tracking API surface changes across all providers.
   */
  async apiChangelog(params: ApiChangelogParams = {}): Promise<ApiChangelogResponse> {
    return this.get('/api/v1/changelog/api', toSnakeParams(params))
  }

  // ─── Agent Intelligence ────────────────────────────────────────────────────

  /** Which agent protocols (MCP, A2A, ACP, etc.) each provider supports */
  agentProtocols(params?: AgentProtocolsParams): Promise<AgentProtocolsResponse> {
    return this.get<AgentProtocolsResponse>('/api/v1/agent-protocols', params)
  }

  /** Training data knowledge cutoff dates per model */
  knowledgeCutoff(params?: KnowledgeCutoffParams): Promise<KnowledgeCutoffResponse> {
    return this.get<KnowledgeCutoffResponse>('/api/v1/knowledge-cutoff', params)
  }

  /** Exact message role/format required for tool calls per provider */
  toolCallFormat(params?: ToolCallFormatParams): Promise<ToolCallFormatResponse> {
    return this.get<ToolCallFormatResponse>('/api/v1/tool-call-format', params)
  }

  /** Streaming protocol details — SSE vs WebSocket, events, quirks */
  streamingProtocols(params?: StreamingProtocolsParams): Promise<StreamingProtocolsResponse> {
    return this.get<StreamingProtocolsResponse>('/api/v1/streaming-protocols', params)
  }

  /** Seed parameter support and deterministic output guarantees per provider */
  outputReproducibility(params?: OutputReproducibilityParams): Promise<OutputReproducibilityResponse> {
    return this.get<OutputReproducibilityResponse>('/api/v1/output-reproducibility', params)
  }

  /** Native built-in tools each provider offers (web search, code interpreter, etc.) */
  nativeTools(params?: NativeToolsParams): Promise<NativeToolsResponse> {
    return this.get<NativeToolsResponse>('/api/v1/native-tools', params)
  }

  /** Curated task suitability scores per model (code, reasoning, RAG, etc.) */
  modelTaskFit(params?: ModelTaskFitParams): Promise<ModelTaskFitResponse> {
    return this.get<ModelTaskFitResponse>('/api/v1/model-task-fit', params)
  }

  /** Native PII detection and redaction capabilities per provider */
  piiHandling(params?: PiiHandlingParams): Promise<PiiHandlingResponse> {
    return this.get<PiiHandlingResponse>('/api/v1/pii-handling', params)
  }

  /** Native context compression support per provider */
  contextCompression(params?: ContextCompressionParams): Promise<ContextCompressionResponse> {
    return this.get<ContextCompressionResponse>('/api/v1/context-compression', params)
  }

  /** Security certifications per provider (SOC2, ISO27001, HIPAA, FedRAMP, etc.) */
  securityCertifications(params?: SecurityCertificationsParams): Promise<SecurityCertificationsResponse> {
    return this.get<SecurityCertificationsResponse>('/api/v1/security-certifications', params)
  }

  /** Semantic (similarity-based) caching support per provider */
  semanticCaching(params?: SemanticCachingParams): Promise<SemanticCachingResponse> {
    return this.get<SemanticCachingResponse>('/api/v1/semantic-caching', params)
  }

  /** Provider MCP client/server compliance — distinct from TopNetworks own MCP server */
  mcpSupport(params?: McpSupportParams): Promise<McpSupportResponse> {
    return this.get<McpSupportResponse>('/api/v1/mcp-support', params)
  }

  /** Model lifecycle stage — GA, beta, preview, deprecated, sunset */
  modelLifecycle(params?: ModelLifecycleParams): Promise<ModelLifecycleResponse> {
    return this.get<ModelLifecycleResponse>('/api/v1/model-lifecycle', params)
  }

  /** Secure agent delegation semantics support (A2A, MCP, IAM-based) */
  delegationSupport(params?: DelegationSupportParams): Promise<DelegationSupportResponse> {
    return this.get<DelegationSupportResponse>('/api/v1/delegation-support', params)
  }

  /** Provider native input-side prompt moderation and injection detection */
  promptModeration(params?: PromptModerationParams): Promise<PromptModerationResponse> {
    return this.get<PromptModerationResponse>('/api/v1/prompt-moderation', params)
  }
}