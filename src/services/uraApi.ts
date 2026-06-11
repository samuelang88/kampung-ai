import {
  PrivateTransaction,
  ProjectDetails,
} from './types';
import {
  privateTransactions,
  projectDetails,
  getProjectByName,
  getPrivateTransactionsByName,
  getTransactionsByDistrict,
} from './mockData';

export type { PrivateTransaction, ProjectDetails };

/**
 * Mock URA Data Service API client.
 *
 * Once you obtain a real URA access key (via the URA Data Service portal),
 * replace the mock implementations with real API calls using axios to:
 *   https://www.ura.gov.sg/uraDataService/invokeUraDS?service=PMI_Resi_Transaction
 *
 * Authentication: X-API-Key header + access token flow.
 */

const SIMULATED_DELAY_MS = 350;

function delay(ms: number = SIMULATED_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetch private property transactions by project name.
 * @param projectName - Exact project name (case-insensitive)
 * @param limit - Max results (default: 10)
 */
export async function getPrivateTransactions(
  projectName: string,
  limit: number = 10
): Promise<PrivateTransaction[]> {
  await delay();
  const results = getPrivateTransactionsByName(projectName);
  return results.slice(0, limit);
}

/**
 * Get project details and summary.
 * @param projectName - Exact project name (case-insensitive)
 */
export async function getProjectDetails(
  projectName: string
): Promise<ProjectDetails | null> {
  await delay();
  return getProjectByName(projectName) ?? null;
}

/**
 * Fetch transactions by postal district number (1–28).
 * @param district - D1, D2, ..., D28
 * @param limit - Max results (default: 20)
 */
export async function getTransactionsByDistrict(
  district: number,
  limit: number = 20
): Promise<PrivateTransaction[]> {
  await delay();
  const results = getTransactionsByDistrict(district);
  return results.slice(0, limit);
}

/**
 * Search projects by partial name.
 * @param query - Partial project name
 */
export async function searchProjects(query: string): Promise<ProjectDetails[]> {
  await delay();
  const q = query.toLowerCase();
  return projectDetails.filter((p) =>
    p.projectName.toLowerCase().includes(q)
  );
}

/**
 * Get all available project names.
 */
export async function getAllProjectNames(): Promise<string[]> {
  await delay(100);
  return projectDetails.map((p) => p.projectName);
}
