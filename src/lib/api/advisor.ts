import { z } from 'zod';
import { type ApiClient, createApiClient } from './client';

// mantener en sync con backend: POST /api/v1/advisor/product-qa
// (ProductQaResponseDto, con `sessionId` opcional), POST
// /api/v1/advisor/sessions (ChatSessionResponseDto) y POST
// /api/v1/advisor/feedback (AdvisorFeedbackResponseDto, stub append-only).
// Tipos locales a propósito: el BFF valida la forma mínima que el widget
// necesita (ver src/lib/api/schema.d.ts para el contrato OpenAPI completo).

export interface AdvisorCitation {
  n: number;
  documentId: string;
  chunkId: string;
  title: string;
  snippet: string;
}

export interface ProductQaResponse {
  answer: string;
  citations: AdvisorCitation[];
  abstained: boolean;
}

export type FeedbackValue = 'up' | 'down';

/** Minimal chat session opened for the caller (user or guest). */
export interface ChatSession {
  id: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdvisorFeedbackRequest {
  productId: string;
  question: string;
  answer: string;
  abstained: boolean;
  value: FeedbackValue;
}

const citationSchema = z.object({
  n: z.number().int().min(1),
  documentId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  snippet: z.string(),
});

const productQaResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(citationSchema),
  abstained: z.boolean(),
});

const feedbackBodySchema = z.object({
  productId: z.string().min(1),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1),
  abstained: z.boolean(),
  value: z.enum(['up', 'down']),
});

const chatSessionSchema = z.object({
  id: z.string().min(1),
  messageCount: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// mantener en sync con backend: POST /api/v1/advisor/sessions/:id/messages
// (RecommendResponseDto) y GET /api/v1/advisor/sessions/:id
// (ChatSessionHistoryResponseDto). Tipos locales a propósito: el BFF valida
// la forma mínima que el chat necesita (ver src/lib/api/schema.d.ts).

export interface ChatHistoryMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  citations: unknown[];
  products: unknown[];
  createdAt: string;
}

export interface ChatHistory {
  id: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  messages: ChatHistoryMessage[];
}

/** One recommended product card. Display data always comes from SQL. */
export interface RecommendProduct {
  productId: string;
  name: string;
  slug: string;
  priceAmount: number;
  currency: string;
  inStock: boolean;
  availableQuantity: number;
  imageUrl: string | null;
  reason: string;
  citations: AdvisorCitation[];
}

export interface RecommendResponse {
  message: string;
  products: RecommendProduct[];
  clarifyingQuestion?: string;
}

export interface RecommendInput {
  content: string;
  locale?: string;
  currency?: string;
}

const recommendCitationSchema = citationSchema;

const recommendProductSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  priceAmount: z.number().int().min(0),
  currency: z.string().min(3).max(3),
  inStock: z.boolean(),
  availableQuantity: z.number().int().min(0),
  imageUrl: z.string().nullable(),
  reason: z.string(),
  citations: z.array(recommendCitationSchema),
});

const recommendResponseSchema = z.object({
  message: z.string().min(1),
  products: z.array(recommendProductSchema),
  clarifyingQuestion: z.string().min(1).optional(),
});

const chatHistoryMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['USER', 'ASSISTANT']),
  content: z.string(),
  citations: z.array(z.unknown()).optional().default([]),
  products: z.array(z.unknown()).optional().default([]),
  createdAt: z.string(),
});

const chatHistorySchema = z.object({
  id: z.string().min(1),
  messageCount: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(chatHistoryMessageSchema),
});

function parseChatSession(value: unknown): ChatSession {
  const parsed = chatSessionSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid chat session shape');
  }
  return parsed.data;
}

function parseProductQaResponse(value: unknown): ProductQaResponse {
  const parsed = productQaResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid advisor response shape');
  }
  return parsed.data;
}

export function parseRecommendResponse(value: unknown): RecommendResponse {
  const parsed = recommendResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid recommend response shape');
  }
  return parsed.data;
}

export function parseChatHistory(value: unknown): ChatHistory {
  const parsed = chatHistorySchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid chat history shape');
  }
  return parsed.data;
}

/** Narrows a stored history `products` entry into a displayable card. */
export function asRecommendProduct(value: unknown): RecommendProduct | null {
  const parsed = recommendProductSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Narrows a stored history `citations` entry into a displayable citation. */
export function asAdvisorCitation(value: unknown): AdvisorCitation | null {
  const parsed = citationSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** localStorage key for the persistent chat session (per locale). */
export function chatSessionStorageKey(locale: string): string {
  return `techadvisor:advisor-chat:${locale}`;
}

/** localStorage key for the multi-session history (per locale). */
export function chatSessionHistoryStorageKey(locale: string): string {
  return `techadvisor:advisor-chat:history:${locale}`;
}

/** Maximum sessions kept in the browser history (guests included). */
export const ADVISOR_HISTORY_LIMIT = 20;

export interface ChatSessionHistoryEntry {
  id: string;
  /** First user message of the session, truncated for display. */
  preview?: string;
  updatedAt?: string;
}

const chatSessionHistoryEntrySchema = z.object({
  id: z.string().min(1),
  preview: z.string().max(120).optional(),
  updatedAt: z.string().optional(),
});

const chatSessionListSchema = z.array(chatSessionSchema);

/** Parses the backend session list (`GET /advisor/sessions`). Throws on shape mismatch. */
export function parseChatSessionList(value: unknown): ChatSession[] {
  const parsed = chatSessionListSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error('Invalid chat session list shape');
  }
  return parsed.data;
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode: history simply does not persist.
  }
}

/** Reads the browser-side session history (tolerates corrupt JSON). */
export function readChatSessionHistory(locale: string): ChatSessionHistoryEntry[] {
  const raw = readStorage(chatSessionHistoryStorageKey(locale));
  if (!raw) return [];
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const entries: ChatSessionHistoryEntry[] = [];
  for (const item of parsed) {
    const entry = chatSessionHistoryEntrySchema.safeParse(item);
    if (entry.success) entries.push(entry.data);
  }
  return entries.slice(0, ADVISOR_HISTORY_LIMIT);
}

function persistChatSessionHistory(locale: string, entries: ChatSessionHistoryEntry[]): void {
  writeStorage(
    chatSessionHistoryStorageKey(locale),
    JSON.stringify(entries.slice(0, ADVISOR_HISTORY_LIMIT)),
  );
}

/**
 * Upserts one session at the front of the browser history (deduplicated by
 * id, capped). Also refreshes the legacy single-session key so old code
 * paths keep restoring the current conversation.
 */
export function upsertChatSessionHistory(
  locale: string,
  entry: ChatSessionHistoryEntry,
): ChatSessionHistoryEntry[] {
  const rest = readChatSessionHistory(locale).filter((item) => item.id !== entry.id);
  const next = [entry, ...rest].slice(0, ADVISOR_HISTORY_LIMIT);
  persistChatSessionHistory(locale, next);
  writeStorage(chatSessionStorageKey(locale), entry.id);
  return next;
}

export function removeChatSessionFromHistory(
  locale: string,
  sessionId: string,
): ChatSessionHistoryEntry[] {
  const next = readChatSessionHistory(locale).filter((item) => item.id !== sessionId);
  persistChatSessionHistory(locale, next);
  return next;
}

/**
 * One-time migration of the legacy single-session slot into the history
 * list. Returns the legacy id (if any) without duplicating existing entries.
 */
export function migrateLegacyChatSession(locale: string): string | null {
  const legacy = readStorage(chatSessionStorageKey(locale));
  if (!legacy) return null;
  const known = readChatSessionHistory(locale).some((item) => item.id === legacy);
  if (!known) {
    persistChatSessionHistory(
      locale,
      [{ id: legacy }, ...readChatSessionHistory(locale)].slice(0, ADVISOR_HISTORY_LIMIT),
    );
  }
  return legacy;
}

/** Shortens the first user message for the history selector. Pure. */
export function truncateSessionPreview(text: string, maxLength = 60): string {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= maxLength) return singleLine;
  return `${singleLine.slice(0, maxLength - 1).trimEnd()}…`;
}

interface ErrorBody {
  code?: unknown;
  message?: unknown;
}

export type AdvisorErrorKind = 'rate-limit' | 'not-found' | 'provider' | 'network' | 'generic';

export function classifyAdvisorError(status: number, body: unknown): AdvisorErrorKind {
  const code = body !== null && typeof body === 'object' ? (body as ErrorBody).code : undefined;
  if (status === 429 || code === 'TOO_MANY_REQUESTS') return 'rate-limit';
  if (status === 404) return 'not-found';
  if (status === 503 || code === 'SERVICE_UNAVAILABLE') return 'provider';
  if (status === 0) return 'network';
  return 'generic';
}

export interface AdvisorSseResult {
  products: RecommendProduct[];
  clarifyingQuestion?: string;
}

interface SseFrame {
  event: string;
  data: string;
}

/**
 * Parses raw SSE text into frames (`event: <name>` + `data: <json>` lines).
 * Pure: unit-tested without network.
 */
export function parseSseFrames(text: string): SseFrame[] {
  const frames: SseFrame[] = [];
  for (const chunk of text.split('\n\n')) {
    const lines = chunk.split('\n').map((line) => line.trim());
    const eventLine = lines.find((line) => line.startsWith('event:'));
    const dataLine = lines.find((line) => line.startsWith('data:'));
    if (!eventLine || !dataLine) continue;
    frames.push({
      event: eventLine.slice('event:'.length).trim(),
      data: dataLine.slice('data:'.length).trim(),
    });
  }
  return frames;
}

function applySseFrames(
  frames: SseFrame[],
  onDelta: (text: string) => void,
  result: AdvisorSseResult,
): void {
  for (const frame of frames) {
    let data: unknown = null;
    try {
      data = JSON.parse(frame.data) as unknown;
    } catch {
      continue;
    }
    if (frame.event === 'delta' && typeof (data as { text?: unknown }).text === 'string') {
      onDelta((data as { text: string }).text);
    } else if (
      frame.event === 'products' &&
      Array.isArray((data as { products?: unknown }).products)
    ) {
      const parsed = z
        .array(recommendProductSchema)
        .safeParse((data as { products: unknown }).products);
      if (parsed.success) result.products = parsed.data;
    } else if (
      frame.event === 'clarifyingQuestion' &&
      typeof (data as { clarifyingQuestion?: unknown }).clarifyingQuestion === 'string'
    ) {
      result.clarifyingQuestion = (data as { clarifyingQuestion: string }).clarifyingQuestion;
    }
  }
}

/**
 * Streams a recommendation over SSE (`Accept: text/event-stream`). Deltas are
 * delivered via `onDelta` as they arrive; the resolved value carries the
 * validated product cards. Throws on non-2xx (the JSON error body is parsed
 * when possible so callers can classify it).
 */
export async function streamRecommendation(
  url: string,
  input: RecommendInput,
  options: {
    onDelta: (text: string) => void;
    signal?: AbortSignal;
    fetchFn?: typeof fetch;
  },
): Promise<AdvisorSseResult> {
  const fetchFn = options.fetchFn ?? fetch;
  let res: Response;
  try {
    res = await fetchFn(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      credentials: 'same-origin',
      body: JSON.stringify(input),
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Advisor stream request failed');
  }
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const error = new Error(`Advisor stream failed with status ${String(res.status)}`);
    (error as { status?: number; body?: unknown }).status = res.status;
    (error as { status?: number; body?: unknown }).body = body;
    throw error;
  }
  const result: AdvisorSseResult = { products: [] };
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    // The server answered buffered JSON instead of SSE (or a proxy
    // stripped the Accept header): validate it like a recommend response
    // and deliver the full text at once.
    const body: unknown = await res.json().catch(() => null);
    const parsed = parseRecommendResponse(body);
    options.onDelta(parsed.message);
    result.products = parsed.products;
    result.clarifyingQuestion = parsed.clarifyingQuestion;
    return result;
  }
  if (!res.body) return result;
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
    if (done) break;
    const frames = parseSseFrames(buffer);
    // Keep the last (possibly incomplete) frame buffered.
    const cutAt = buffer.lastIndexOf('\n\n');
    if (cutAt >= 0) buffer = buffer.slice(cutAt + 2);
    applySseFrames(frames, options.onDelta, result);
  }
  applySseFrames(parseSseFrames(buffer), options.onDelta, result);
  return result;
}

/**
 * Advisor reads. Habla con el BFF same-origin (`/api/advisor/*`), que
 * reenvía al backend; nunca importa código del backend.
 */
export function createAdvisorApi(client: ApiClient = createApiClient()) {
  return {
    askProduct: async (input: {
      productId: string;
      question: string;
      locale?: string;
      /** Owned chat session to record the turn in; omitted = stateless. */
      sessionId?: string;
    }): Promise<ProductQaResponse> => {
      const raw = await client.post<unknown>('/advisor/product-qa', input);
      return parseProductQaResponse(raw);
    },
    createSession: async (): Promise<ChatSession> => {
      const raw = await client.post<unknown>('/advisor/sessions', {});
      return parseChatSession(raw);
    },
    listSessions: async (): Promise<ChatSession[]> => {
      const raw = await client.get<unknown>('/advisor/sessions');
      return parseChatSessionList(raw);
    },
    getSessionHistory: async (sessionId: string): Promise<ChatHistory> => {
      const raw = await client.get<unknown>(`/advisor/sessions/${encodeURIComponent(sessionId)}`);
      return parseChatHistory(raw);
    },
    recommend: async (sessionId: string, input: RecommendInput): Promise<RecommendResponse> => {
      const raw = await client.post<unknown>(
        `/advisor/sessions/${encodeURIComponent(sessionId)}/messages`,
        {
          content: input.content,
          ...(input.locale ? { locale: input.locale } : {}),
          ...(input.currency ? { currency: input.currency } : {}),
        },
      );
      return parseRecommendResponse(raw);
    },
    sendFeedback: (input: AdvisorFeedbackRequest): Promise<{ ok: boolean }> => {
      const body = feedbackBodySchema.parse(input);
      return client.post<{ ok: boolean }>('/advisor/feedback', body);
    },
  };
}

export type AdvisorApi = ReturnType<typeof createAdvisorApi>;
