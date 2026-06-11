/**
 * Real URA Data Service API Client
 *
 * Communicates with the official URA Data Service to fetch private property
 * transaction data for Singapore's 28 postal districts.
 *
 * Authentication flow:
 *   1. Generate a fresh token via POST /insertNewToken/v1 (AccessKey header)
 *   2. Use the token in subsequent GET /invokeUraDS/v1 requests (AccessKey + Token headers)
 *
 * Token lifetime: 24 hours (generated fresh per app session).
 * Data refreshed: Tuesday and Friday evenings (SGT).
 * Records older than 5 years may be modified or removed.
 *
 * @see https://www.ura.gov.sg/maps/api/
 */

import {
  API_BASE_URL,
  ACCESS_KEY,
  MAX_TOKEN_RETRIES,
  REQUEST_TIMEOUT_MS,
  DISTRICT_TO_BATCH,
  DISTRICT_NAMES,
  getMarketSegment,
} from './uraConfig';
import type { PrivateTransaction } from './types';

// ─── Types ─────────────────────────────────────────────────────────

interface UraTokenResponse {
  Result: string;
  Token?: string;
  ErrorMsg?: string;
}

interface UraTransactionRecord {
  contractDate: string;     // "mmyy" format, e.g. "0326" = March 2026
  price: string;            // e.g. "3200000"
  area: string;             // floor area in sqm, e.g. "120"
  typeOfSale: string;       // "1"=New Sale, "2"=Sub Sale, "3"=Resale
  floorRange?: string;      // e.g. "01" floor range
  propertyType: string;     // e.g. "Condo", "Apartment"
  tenure: string;           // e.g. "99-year Leasehold", "Freehold"
  street: string;
  district: string;         // e.g. "4"
  marketSegment: string;    // "CCR", "RCR", or "OCR"
  noOfUnits?: string;
  yearCompleted?: string;
  project?: string;         // only present when project name is known (batch queries)
  name?: string;            // alternative field for project name
}

interface UraBatchResponse {
  Result: string;
  ErrorMsg?: string;
  transactions?: UraTransactionRecord[];
}

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Decode a response body that may contain non-UTF-8 encoded characters.
 * The URA API has been known to encode some characters using extended-ASCII /
 * Latin-1 encoding in certain batches. We attempt UTF-8 first, then fall back
 * to Latin-1 (ISO-8859-1) and finally a best-effort decode with replacement.
 */
async function safeDecodeResponse(response: Response): Promise<string> {
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Try UTF-8 first (most common)
  try {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    // Fall through to next attempt
  }

  // Try Latin-1 (ISO-8859-1) — handles extended characters
  try {
    const decoder = new TextDecoder('iso-8859-1', { fatal: true });
    return decoder.decode(bytes);
  } catch {
    // Fall through
  }

  // Best-effort: replace invalid sequences
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

/**
 * Parse a "mmyy" contract date into a human-readable "MMM YYYY" string.
 * E.g. "0326" → "Mar 2026", "1125" → "Nov 2025"
 */
function parseContractDate(mmyy: string): string {
  if (!mmyy || mmyy.length < 4) return mmyy;

  const monthStr = mmyy.substring(0, 2);
  const yearStr = mmyy.substring(2, 4);

  const months: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
  };

  const month = months[monthStr] ?? monthStr;
  const year = `20${yearStr}`;
  return `${month} ${year}`;
}

/**
 * Map URA property type to the app's enumerated type.
 */
function mapPropertyType(raw: string): PrivateTransaction['type'] {
  const t = raw.toLowerCase();
  if (t.includes('condo')) return 'Condo';
  if (t.includes('apartment')) return 'Apartment';
  if (t.includes('terrace')) return 'Terrace';
  if (t.includes('semi') || t.includes('semi-detached')) return 'Semi-D';
  if (t.includes('bungalow') || t.includes('detached')) return 'Bungalow';
  // Default guess based on common patterns
  return 'Condo';
}

/**
 * Convert a URA raw record to our PrivateTransaction type.
 */
function mapRecord(t: UraTransactionRecord): PrivateTransaction {
  const projectName = t.project ?? t.name ?? 'Unknown';
  const districtNum = parseInt(t.district, 10) || 0;
  const areaSqm = parseFloat(t.area) || 0;
  const areaSqft = areaSqm * 10.7639;
  const price = parseInt(t.price, 10) || 0;
  const psf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;
  const psm = areaSqm > 0 ? Math.round(price / areaSqm) : 0;

  return {
    projectName,
    address: t.street || '',
    district: districtNum,
    propertyType: t.propertyType || '',
    tenure: t.tenure || '',
    areaSqft: Math.round(areaSqft),
    areaSqm: Math.round(areaSqm * 100) / 100,
    price,
    psf,
    psm,
    contractDate: parseContractDate(t.contractDate),
    districtName: DISTRICT_NAMES[districtNum] ?? `District ${districtNum}`,
    type: mapPropertyType(t.propertyType),
    marketSegment: getMarketSegment(districtNum),
  };
}

/**
 * AbortController-backed fetch with timeout.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Token Management ──────────────────────────────────────────────

let cachedToken: string | null = null;
let tokenRetryCount = 0;

/**
 * Generate a fresh authentication token from the URA API.
 *
 * @throws If the API returns an error or the access key is missing.
 */
export async function generateToken(): Promise<string> {
  if (!ACCESS_KEY) {
    throw new Error(
      'URA_ACCESS_KEY is not configured. Set EXPO_PUBLIC_URA_ACCESS_KEY in your .env file.'
    );
  }

  const url = `${API_BASE_URL}/insertNewToken/v1`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      AccessKey: ACCESS_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(
      `URA token request failed with status ${response.status} ${response.statusText}`
    );
  }

  const body = await safeDecodeResponse(response);
  let data: UraTokenResponse;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(`URA token response is not valid JSON: ${body.substring(0, 200)}`);
  }

  if (data.Result !== 'success' || !data.Token) {
    throw new Error(
      `URA token generation failed: ${data.ErrorMsg ?? data.Result ?? 'unknown error'}`
    );
  }

  tokenRetryCount = 0;
  cachedToken = data.Token;
  return data.Token;
}

/**
 * Get a valid token, generating a fresh one if needed.
 * Retries up to MAX_TOKEN_RETRIES times on failure.
 */
export async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;
  return await generateToken();
}

/**
 * Invalidate the cached token so the next call generates a fresh one.
 * Called when the API returns a 401 (token expired).
 */
function invalidateToken(): void {
  cachedToken = null;
}

// ─── Batch Queries ─────────────────────────────────────────────────

/**
 * Fetch all transactions for a given batch number (1–4).
 * Returns raw records from the URA API.
 */
async function fetchBatch(
  batch: number,
  retryOnExpiry: boolean = true
): Promise<UraTransactionRecord[]> {
  const token = await getToken();
  const url = `${API_BASE_URL}/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=${batch}`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      AccessKey: ACCESS_KEY,
      Token: token,
    },
  });

  // Token expired — retry with a fresh token if we haven't exhausted retries
  if (response.status === 401) {
    if (retryOnExpiry && tokenRetryCount < MAX_TOKEN_RETRIES) {
      tokenRetryCount++;
      invalidateToken();
      return fetchBatch(batch, true);
    }
    throw new Error(
      `URA API returned 401 (unauthorized) after ${tokenRetryCount} retries. Token may be invalid.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `URA batch ${batch} request failed with status ${response.status} ${response.statusText}`
    );
  }

  const body = await safeDecodeResponse(response);
  let data: UraBatchResponse;
  try {
    data = JSON.parse(body);
  } catch {
    throw new Error(
      `URA batch ${batch} response is not valid JSON: ${body.substring(0, 200)}`
    );
  }

  if (data.Result !== 'success') {
    throw new Error(
      `URA batch ${batch} returned error: ${data.ErrorMsg ?? data.Result ?? 'unknown error'}`
    );
  }

  return data.transactions ?? [];
}

/**
 * Query all 4 batches and return every transaction record.
 * Batches are fetched in parallel for speed.
 *
 * If individual batches fail, the error is logged and an empty array
 * is returned for that batch (partial results still returned).
 */
export async function fetchAllTransactions(): Promise<PrivateTransaction[]> {
  const promises = [1, 2, 3, 4].map(async (batch) => {
    try {
      const records = await fetchBatch(batch);
      return records.map(mapRecord);
    } catch (error) {
      console.warn(`[uraApiReal] Batch ${batch} failed:`, error);
      return [] as PrivateTransaction[];
    }
  });

  const results = await Promise.allSettled(promises);
  const all: PrivateTransaction[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      all.push(...result.value);
    }
  }

  return all;
}

// ─── Query Methods ─────────────────────────────────────────────────

/** In-memory cache to avoid re-fetching all batches on every query */
let cachedTransactions: PrivateTransaction[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get all transactions, using cache if available.
 * Automatically re-fetches after CACHE_TTL_MS or if no cache exists.
 */
async function getAllTransactions(): Promise<PrivateTransaction[]> {
  const now = Date.now();
  if (cachedTransactions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedTransactions;
  }

  cachedTransactions = await fetchAllTransactions();
  lastFetchTime = now;
  return cachedTransactions;
}

/**
 * Find transactions by exact project name (case-insensitive).
 *
 * @param projectName - The project name to search for.
 * @returns Array of matching transactions, sorted by date (newest first).
 */
export async function getTransactionByProject(
  projectName: string
): Promise<PrivateTransaction[]> {
  if (!projectName || !projectName.trim()) return [];

  const all = await getAllTransactions();
  const q = projectName.trim().toLowerCase();

  const results = all.filter(
    (t) => t.projectName.toLowerCase() === q
  );

  // Sort newest first by parsing the contract date
  return results.sort((a, b) => {
    const dateA = parseDisplayDate(a.contractDate);
    const dateB = parseDisplayDate(b.contractDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Search for projects by partial name match (case-insensitive).
 *
 * @param query - Partial project name to search for.
 * @returns Array of matching transactions (one representative per unique project).
 */
export async function searchProjects(
  query: string
): Promise<PrivateTransaction[]> {
  if (!query || !query.trim()) return [];

  const all = await getAllTransactions();
  const q = query.trim().toLowerCase();

  // Filter all transactions matching the query
  const matches = all.filter(
    (t) => t.projectName.toLowerCase().includes(q)
  );

  // Deduplicate by project name, keeping the most recent transaction
  const seen = new Set<string>();
  const unique: PrivateTransaction[] = [];

  const sorted = matches.sort((a, b) => {
    const dateA = parseDisplayDate(a.contractDate);
    const dateB = parseDisplayDate(b.contractDate);
    return dateB.getTime() - dateA.getTime();
  });

  for (const t of sorted) {
    const key = t.projectName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }

  return unique;
}

/**
 * Fetch transactions by Singapore postal district (1–28).
 *
 * @param district - District number (1–28).
 * @returns Array of transactions in that district, sorted by date (newest first).
 */
export async function getTransactionsByDistrict(
  district: number
): Promise<PrivateTransaction[]> {
  const all = await getAllTransactions();
  const results = all.filter((t) => t.district === district);

  return results.sort((a, b) => {
    const dateA = parseDisplayDate(a.contractDate);
    const dateB = parseDisplayDate(b.contractDate);
    return dateB.getTime() - dateA.getTime();
  });
}

// ─── Internal Helpers ──────────────────────────────────────────────

/**
 * Parse a display date string ("MMM YYYY") to a Date for sorting.
 */
function parseDisplayDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

/**
 * Clear the in-memory cache. Useful for testing or forcing a refresh.
 */
export function clearCache(): void {
  cachedTransactions = null;
  lastFetchTime = 0;
}
