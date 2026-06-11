/**
 * URA API Service — Real API with Mock Fallback
 *
 * This module first attempts to use the real URA Data Service API.
 * If the real API is unavailable (no access key configured, network error,
 * or API failure), it transparently falls back to local mock data.
 *
 * Exports the same function signatures as before for backward compatibility:
 *   - getPrivateTransactions(projectName, limit)
 *   - getProjectDetails(projectName)
 *   - getTransactionsByDistrict(district, limit)
 *   - searchProjects(query)
 *   - getAllProjectNames()
 */

import {
  PrivateTransaction,
  ProjectDetails,
} from './types';

// ─── Real API Imports ─────────────────────────────────────────────

import {
  getTransactionByProject as realGetTransactionByProject,
  searchProjects as realSearchProjects,
  getTransactionsByDistrict as realGetTransactionsByDistrict,
} from './uraApiReal';

// ─── Mock Data Imports (Fallback) ─────────────────────────────────

import {
  privateTransactions as mockTransactions,
  projectDetails as mockProjectDetails,
  getProjectByName,
  getPrivateTransactionsByName,
  getTransactionsByDistrict as getMockTransactionsByDistrict,
} from './mockData';

export type { PrivateTransaction, ProjectDetails };

// ─── Real API Available? ───────────────────────────────────────────

const ACCESS_KEY = process.env.EXPO_PUBLIC_URA_ACCESS_KEY ?? '';

function isRealApiAvailable(): boolean {
  return ACCESS_KEY.length > 0;
}

// ─── Exported Functions ────────────────────────────────────────────

/**
 * Fetch private property transactions by project name.
 * Attempts the real URA API first, falls back to mock data on failure.
 *
 * @param projectName - Exact project name (case-insensitive)
 * @param limit - Max results (default: 10)
 */
export async function getPrivateTransactions(
  projectName: string,
  limit: number = 10
): Promise<PrivateTransaction[]> {
  if (isRealApiAvailable()) {
    try {
      const results = await realGetTransactionByProject(projectName);
      return results.slice(0, limit);
    } catch (error) {
      console.warn(
        '[uraApi] Real API failed, falling back to mock:',
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback to mock data
  const results = getPrivateTransactionsByName(projectName);
  return results.slice(0, limit);
}

/**
 * Get project details and summary.
 * Attempts the real URA API first, falls back to mock data on failure.
 *
 * Note: The real URA API does not provide project details (tenure, units,
 * amenities, etc.) in the transaction data. For now, this falls back to
 * mock project details. You may extend this with a future project-level API.
 *
 * @param projectName - Exact project name (case-insensitive)
 */
export async function getProjectDetails(
  projectName: string
): Promise<ProjectDetails | null> {
  // Real API doesn't expose project detail endpoints; use mock data
  return getProjectByName(projectName) ?? null;
}

/**
 * Fetch transactions by postal district number (1–28).
 * Attempts the real URA API first, falls back to mock data on failure.
 *
 * @param district - D1, D2, ..., D28
 * @param limit - Max results (default: 20)
 */
export async function getTransactionsByDistrict(
  district: number,
  limit: number = 20
): Promise<PrivateTransaction[]> {
  if (isRealApiAvailable()) {
    try {
      const results = await realGetTransactionsByDistrict(district);
      return results.slice(0, limit);
    } catch (error) {
      console.warn(
        '[uraApi] Real API failed, falling back to mock:',
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback to mock data
  const results = getMockTransactionsByDistrict(district);
  return results.slice(0, limit);
}

/**
 * Search projects by partial name.
 * Attempts the real URA API first, falls back to mock data on failure.
 *
 * NOTE: The real API returns PrivateTransaction[] for search results,
 * while the original mock returned ProjectDetails[]. We map results
 * back to ProjectDetails when possible; unmatched results are omitted.
 *
 * @param query - Partial project name
 */
export async function searchProjects(
  query: string
): Promise<ProjectDetails[]> {
  if (isRealApiAvailable()) {
    try {
      const results = await realSearchProjects(query);
      // Map PrivateTransaction results back to ProjectDetails
      const seen = new Set<string>();
      const projects: ProjectDetails[] = [];

      for (const t of results) {
        const key = t.projectName.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        // Check if we have detailed mock data for this project
        const mockDetail = getProjectByName(t.projectName);
        if (mockDetail) {
          projects.push(mockDetail);
        } else {
          // Build a partial ProjectDetails from transaction data
          projects.push({
            projectName: t.projectName,
            address: t.address,
            district: t.district,
            districtName: t.districtName,
            tenure: t.tenure,
            totalUnits: 0,
            yearCompleted: 0,
            propertyType: t.propertyType,
            marketSegment: t.marketSegment,
            description: '',
            amenities: [],
          });
        }
      }

      return projects;
    } catch (error) {
      console.warn(
        '[uraApi] Real API failed, falling back to mock:',
        error instanceof Error ? error.message : error
      );
    }
  }

  // Fallback to mock data
  const q = query.toLowerCase();
  return mockProjectDetails.filter((p) =>
    p.projectName.toLowerCase().includes(q)
  );
}

/**
 * Get all available project names from mock data.
 */
export async function getAllProjectNames(): Promise<string[]> {
  return mockProjectDetails.map((p) => p.projectName);
}
