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
  RegisterParams,
  RegisterResponse,
  VerifyParams,
  VerifyResponse,
  SignParams,
  SignResponse,
  ValidateParams,
  ValidateResponse,
  McpResponse,
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

  /** Register an agent output contract. Returns a verifiable ID. */
  async register(params: RegisterParams): Promise<RegisterResponse> {
    return this.post('/api/v1/register', {
      agent_id: params.agentId,
      schema_version: params.schemaVersion,
      integrity_hash: params.integrityHash,
      description: params.description,
      tags: params.tags,
      ttl_hours: params.ttlHours,
    })
  }

  /** Verify a registered contract by ID. */
  async verify(id: string, params: VerifyParams = {}): Promise<VerifyResponse> {
    return this.get(`/api/v1/verify/${encodeURIComponent(id)}`, params)
  }

  /** Sign an input payload hash. Get a tamper-evident HMAC receipt. */
  async sign(params: SignParams): Promise<SignResponse> {
    return this.post('/api/v1/sign', {
      signer_id: params.signerId,
      payload_hash: params.payloadHash,
      metadata: params.metadata,
      ttl_hours: params.ttlHours,
    })
  }

  /** Validate a signed HMAC receipt. */
  async validate(id: string, params: ValidateParams = {}): Promise<ValidateResponse> {
    return this.get(`/api/v1/validate/${encodeURIComponent(id)}`, params)
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
}
