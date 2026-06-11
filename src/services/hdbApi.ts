import { HDBTransaction } from './types';
import { hdbTransactions } from './mockData';

export type { HDBTransaction };

/**
 * HDB Resale Price API — data.gov.sg
 *
 * Real endpoint (when you have an API key):
 *   https://data.gov.sg/api/action/datastore_search
 *   Resource ID: d_ea9e50ef5b1c3e0bb23dfadce8a1f1cb
 *
 * For production, add X-API-Key header with your DATA_GOV_SG_KEY.
 */

const DATA_GOV_SG_BASE = 'https://data.gov.sg/api/action/datastore_search';
const RESOURCE_ID = 'd_ea9e50ef5b1c3e0bb23dfadce8a1f1cb';

const SIMULATED_DELAY_MS = 400;

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRemainingLease(leaseStr: string): number {
  const match = leaseStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Fetch HDB resale transactions for a specific block and street.
 *
 * In production this calls data.gov.sg API with SQL-like filter.
 * Currently falls back to local mock data.
 *
 * @param block - Block number (e.g. "129")
 * @param street - Street name (e.g. "Kim Tian Road")
 */
export async function getBlockTransactions(
  block: string,
  street: string
): Promise<HDBTransaction[]> {
  await delay();

  // Mock: filter local data
  const results = hdbTransactions.filter(
    (t) =>
      t.block.toLowerCase() === block.toLowerCase() &&
      t.street.toLowerCase().includes(street.toLowerCase())
  );

  if (results.length > 0) {
    return results;
  }

  // If no local match, return a simulated result based on town
  return generateMockTransactions(block, street);
}

/**
 * Fetch HDB resale transactions by town name.
 * @param town - e.g. "Bukit Merah", "Tiong Bahru", "Queenstown"
 */
export async function getTransactionsByTown(
  town: string
): Promise<HDBTransaction[]> {
  await delay();
  return hdbTransactions.filter(
    (t) => t.town.toLowerCase() === town.toLowerCase()
  );
}

/**
 * Fetch recent resale transactions (general).
 * @param limit - Max results
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<HDBTransaction[]> {
  await delay();
  return hdbTransactions.slice(0, limit);
}

// ─── Mock generator for unknown blocks ────────────────────────────

const FLAT_TYPES = ['3-Room', '4-Room', '5-Room', 'Executive'];
const TOWNS_SAMPLE = ['Bukit Merah', 'Tiong Bahru', 'Queenstown', 'Bishan', 'Toa Payoh', 'Clementi', 'Bedok', 'Ang Mo Kio'];

function generateMockTransactions(
  block: string,
  street: string
): HDBTransaction[] {
  const town = TOWNS_SAMPLE[Math.floor(Math.random() * TOWNS_SAMPLE.length)];
  const flatType = FLAT_TYPES[Math.floor(Math.random() * FLAT_TYPES.length)];
  const basePrice = flatType === '4-Room' ? 520000 : flatType === '5-Room' ? 680000 : 420000;
  const areaSqm = flatType === '4-Room' ? 88 : flatType === '5-Room' ? 110 : 75;

  return Array.from({ length: 3 }, (_, i) => {
    const randomOffset = Math.round((Math.random() * 60000 - 30000) / 10000) * 10000;
    const price = basePrice + randomOffset + i * 15000;
    return {
      block,
      street,
      town,
      flatType,
      floorRange: `${4 + i * 2} to ${6 + i * 2}`,
      floorAreaSqm: areaSqm,
      leaseCommenceDate: 1980 - i * 3,
      remainingLease: `${60 - i * 3} years`,
      resalePrice: price,
      transactionDate: `2024-0${3 - i}`,
      unitPricePsf: Math.round((price / (areaSqm * 10.764)) * 10) / 10,
      unitPricePsm: Math.round((price / areaSqm) * 10) / 10,
    };
  });
}
