/** Shared types for Kampung.ai property data */

export interface HDBTransaction {
  block: string;
  street: string;
  town: string;
  flatType: string;
  floorRange: string;
  floorAreaSqm: number;
  leaseCommenceDate: number;
  remainingLease: string;
  resalePrice: number;
  transactionDate: string; // YYYY-MM
  unitPricePsf: number;
  unitPricePsm: number;
}

export interface PrivateTransaction {
  projectName: string;
  address: string;
  district: number;
  propertyType: string;
  tenure: string;
  areaSqft: number;
  areaSqm: number;
  price: number;
  psf: number;
  psm: number;
  contractDate: string; // MMM YYYY e.g. "Oct 2025"
  districtName: string;
  type: 'Condo' | 'Apartment' | 'Terrace' | 'Semi-D' | 'Bungalow';
  marketSegment: 'OCR' | 'RCR' | 'CCR';
}

export interface ProjectDetails {
  projectName: string;
  address: string;
  district: number;
  districtName: string;
  tenure: string;
  totalUnits: number;
  yearCompleted: number;
  propertyType: string;
  marketSegment: 'OCR' | 'RCR' | 'CCR';
  description: string;
  amenities: string[];
}

export interface ValuationResult {
  estimatedValue: number;
  confidenceLow: number;
  confidenceHigh: number;
  confidenceLevel: number; // 0-100
  comparableSales: PrivateTransaction[];
  leaseDecayProjection: LeaseDecayPoint[];
  recommendation: 'Buy' | 'Rent' | 'Neutral';
  recommendationReason: string;
  rentalYield: number;
  psfTrend: 'up' | 'down' | 'stable';
  psfChangePercent: number;
}

export interface LeaseDecayPoint {
  year: number;
  value: number;
  remainingLease: number;
}

export interface MRTStation {
  name: string;
  lines: string[];
  distanceKm: number;
  walkingMinutes: number;
}

export interface School {
  name: string;
  type: 'Primary' | 'Secondary' | 'JC' | 'International';
  distanceKm: number;
  moeCode?: string;
}
