/**
 * URA Data Service API Configuration
 *
 * District-to-batch mapping for Singapore's 28 postal districts.
 * The URA API splits private property transactions into 4 batches:
 *   Batch 1: D01–D07 (City, HarbourFront, Bukit Merah, etc.)
 *   Batch 2: D08–D13 (Little India, Orchard, Bukit Timah, etc.)
 *   Batch 3: D14–D20 (Geylang, Bedok, Marine Parade, etc.)
 *   Batch 4: D21–D28 (Batok, Clementi, Woodlands, etc.)
 *
 * Data is refreshed every Tuesday and Friday evening.
 */

/** URA Data Service base URL */
export const API_BASE_URL =
  'https://eservice.ura.gov.sg/uraDataService';

/**
 * URA Access Key — set via environment variable URA_ACCESS_KEY.
 * Register at: https://www.ura.gov.sg/maps/api/
 */
export const ACCESS_KEY = process.env.EXPO_PUBLIC_URA_ACCESS_KEY ?? '';

/** How many times to retry a request on token expiry (HTTP 401) */
export const MAX_TOKEN_RETRIES = 2;

/** Timeout per HTTP request in milliseconds */
export const REQUEST_TIMEOUT_MS = 30_000;

/**
 * Mapping: district numbers → batch number (1-indexed).
 * Districts are grouped as follows:
 *   Batch 1: D01–D07
 *   Batch 2: D08–D13
 *   Batch 3: D14–D20
 *   Batch 4: D21–D28
 */
export const DISTRICT_TO_BATCH: Record<number, number> = {
  1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1,
  8: 2, 9: 2, 10: 2, 11: 2, 12: 2, 13: 2,
  14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
  21: 4, 22: 4, 23: 4, 24: 4, 25: 4, 26: 4, 27: 4, 28: 4,
};

/**
 * Human-readable names per Singapore district.
 * Source: URA / Singapore Institute of Surveyors and Valuers.
 */
export const DISTRICT_NAMES: Record<number, string> = {
  1: 'Marina Bay / Raffles Place / Cecil',
  2: 'Chinatown / Tanjong Pagar / Anson',
  3: 'Tiong Bahru / Alexandra / Queenstown',
  4: 'Telok Blangah / HarbourFront / Sentosa',
  5: 'Buona Vista / West Coast / Pasir Panjang',
  6: 'High Street / City Hall / Clarke Quay',
  7: 'Beach Road / Bugis / Rochor / Middle Road',
  8: 'Little India / Farrer Park / Serangoon',
  9: 'Orchard / River Valley / Cairnhill',
  10: 'Bukit Timah / Holland / Tanglin',
  11: 'Mount Pleasant / Novena / Thomson',
  12: 'Balestier / Toa Payoh / Serangoon',
  13: 'MacPherson / Potong Pasir / Geylang Bahru',
  14: 'Geylang / Eunos / Paya Lebar',
  15: 'East Coast / Marine Parade / Joo Chiat',
  16: 'Bedok / Upper East Coast / Siglap',
  17: 'Changi / Loyang / Flora Drive',
  18: 'Tampines / Pasir Ris / Simei',
  19: 'Serangoon Garden / Hougang / Punggol',
  20: 'Bishan / Ang Mo Kio / Thomson',
  21: 'Clementi / Dover / Sunset Way',
  22: 'Boon Lay / Jurong / Tuas',
  23: 'Hillview / Dairy Farm / Choa Chu Kang',
  24: 'Lim Chu Kang / Tengah / Ama Keng',
  25: 'Kranji / Woodlands / Admiralty',
  26: 'Mandai / Upper Thomson / Springleaf',
  27: 'Yishun / Sembawang / Senoko',
  28: 'Seletar / Yio Chu Kang / Khatib',
};

/**
 * Market segment labels for CCR / RCR / OCR based on district.
 * CCR (Core Central Region): D01–D04, D09–D11, D06 (part)
 * RCR (Rest of Central Region): D05, D07, D08, D12–D15, D20 (part)
 * OCR (Outside Central Region): D16–D19, D20 (part), D21–D28
 */
export function getMarketSegment(district: number): 'CCR' | 'RCR' | 'OCR' {
  if ([1, 2, 3, 4, 6, 9, 10, 11].includes(district)) return 'CCR';
  if ([5, 7, 8, 12, 13, 14, 15, 20].includes(district)) return 'RCR';
  return 'OCR';
}

/**
 * Map URA typeOfSale codes to human-readable labels.
 * "1" = New Sale, "2" = Sub Sale, "3" = Resale
 */
export const TYPE_OF_SALE_LABELS: Record<string, string> = {
  '1': 'New Sale',
  '2': 'Sub Sale',
  '3': 'Resale',
};
