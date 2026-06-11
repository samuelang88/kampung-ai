import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/colors';
import { getPrivateTransactions, getProjectDetails } from '../services/uraApi';
import type { PrivateTransaction, ProjectDetails } from '../services/types';

type RouteParams = {
  Property: { projectName: string };
};

const TABS = ['Transactions', 'Schools Nearby', 'MRT Access'] as const;
type TabName = (typeof TABS)[number];

// Mock nearby data
const NEARBY_SCHOOLS = [
  { name: 'CHIJ (Kellock)', type: 'Primary' as const, distanceKm: 0.6 },
  { name: 'River Valley Primary School', type: 'Primary' as const, distanceKm: 0.9 },
  { name: 'Anglo-Chinese School (Junior)', type: 'Primary' as const, distanceKm: 1.2 },
  { name: 'Raffles Institution', type: 'Secondary' as const, distanceKm: 1.8 },
  { name: 'Singapore Chinese Girls\' School', type: 'Secondary' as const, distanceKm: 2.1 },
];

const NEARBY_MRT = [
  { name: 'Havelock', lines: 'Circle Line 6 (Opening 2026)', distanceKm: 0.3 },
  { name: 'Tiong Bahru', lines: 'East-West Line', distanceKm: 0.6 },
  { name: 'Great World', lines: 'Thomson-East Coast Line', distanceKm: 0.9 },
  { name: 'Redhill', lines: 'East-West Line', distanceKm: 1.3 },
];

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function formatDate(dateStr: string): string {
  return dateStr;
}

export default function PropertyScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { projectName } = route.params;

  const [activeTab, setActiveTab] = useState<TabName>('Transactions');
  const [transactions, setTransactions] = useState<PrivateTransaction[]>([]);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [txns, details] = await Promise.all([
          getPrivateTransactions(projectName, 10),
          getProjectDetails(projectName),
        ]);
        setTransactions(txns);
        setProject(details);
      } catch (err) {
        console.error('Failed to load property data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectName]);

  // Compute derived metrics
  const avgPrice =
    transactions.length > 0
      ? transactions.reduce((s, t) => s + t.price, 0) / transactions.length
      : 0;
  const avgPsf =
    transactions.length > 0
      ? Math.round(
          transactions.reduce((s, t) => s + t.psf, 0) / transactions.length
        )
      : 0;
  const rentalYield = avgPrice > 0 ? ((avgPrice * 0.035) / avgPrice) * 100 : 0;
  const psfTrend = transactions.length >= 2 && transactions[0].psf > transactions[transactions.length - 1].psf ? 'up' : 'down';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>Loading property data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Property Header */}
      <View style={styles.header}>
        <Text style={styles.propertyName}>{projectName}</Text>
        {project && (
          <>
            <Text style={styles.address}>{project.address}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.districtBadge}>
                <Text style={styles.districtBadgeText}>
                  D{project.district} · {project.districtName}
                </Text>
              </View>
              <View style={[styles.districtBadge, { backgroundColor: COLORS.green }]}>
                <Text style={styles.districtBadgeText}>{project.tenure}</Text>
              </View>
            </View>
            <Text style={styles.propertyType}>{project.propertyType} · {project.marketSegment}</Text>
          </>
        )}
        {!project && <Text style={styles.address}>No project details available</Text>}
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Current Valuation</Text>
          <Text style={styles.metricValue}>{formatCurrency(Math.round(avgPrice))}</Text>
          <Text style={styles.metricSub}>Avg. of {transactions.length} sales</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>PSF Trend</Text>
          <Text style={[styles.metricValue, psfTrend === 'up' ? { color: COLORS.green } : { color: COLORS.red }]}>
            ${avgPsf}
          </Text>
          <Text style={styles.metricSub}>
            {psfTrend === 'up' ? '↑ Rising' : '↓ Declining'}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Est. Rental Yield</Text>
          <Text style={styles.metricValue}>{rentalYield.toFixed(1)}%</Text>
          <Text style={styles.metricSub}>3.5% gross yield</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.activeTabText]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'Transactions' && (
          <View style={styles.transactionsList}>
            {transactions.length === 0 ? (
              <Text style={styles.emptyState}>No transaction data available</Text>
            ) : (
              transactions.map((txn, i) => (
                <View key={i} style={styles.txnRow}>
                  <View style={styles.txnLeft}>
                    <Text style={styles.txnDate}>{formatDate(txn.contractDate)}</Text>
                    <Text style={styles.txnSize}>{txn.areaSqft.toLocaleString()} sqft</Text>
                  </View>
                  <View style={styles.txnRight}>
                    <Text style={styles.txnPrice}>{formatCurrency(txn.price)}</Text>
                    <Text style={styles.txnPsf}>${txn.psf.toLocaleString()} psf</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'Schools Nearby' && (
          <View style={styles.listContainer}>
            {NEARBY_SCHOOLS.map((school, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listLeft}>
                  <Text style={styles.listTitle}>{school.name}</Text>
                  <Text style={styles.listSub}>{school.type}</Text>
                </View>
                <Text style={styles.listDistance}>{school.distanceKm} km</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'MRT Access' && (
          <View style={styles.listContainer}>
            {NEARBY_MRT.map((mrt, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.listLeft}>
                  <Text style={styles.listTitle}>{mrt.name}</Text>
                  <Text style={styles.listSub}>{mrt.lines}</Text>
                </View>
                <Text style={styles.listDistance}>{mrt.distanceKm} km</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* AI Summary Section */}
      <View style={styles.aiSummaryCard}>
        <Text style={styles.aiSummaryTitle}>🤖 AI Summary</Text>
        <Text style={styles.aiSummaryText}>
          Based on {transactions.length} recent transactions, {projectName} shows
          an average price of {formatCurrency(Math.round(avgPrice))} with an
          average PSF of ${avgPsf}. The{' '}
          {transactions.length > 0 ? 'most recent sale' : 'latest data'} indicates
          a {psfTrend === 'up' ? 'positive' : 'moderating'} price trend.
          {project
            ? ` Located in District ${project.district} (${project.districtName}), this ${project.tenure.toLowerCase()} property offers ${project.description.slice(0, 100)}...`
            : ''}
        </Text>
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => navigation.navigate('Valuation' as never, { projectName } as never)}
        >
          <Text style={styles.aiButtonText}>Get Full AI Valuation</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
  },
  header: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  propertyName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  districtBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
  },
  districtBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  propertyType: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm + 2,
    alignItems: 'center',
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    } as any),
  },
  metricLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: 2,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  metricSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray300,
  },
  tab: {
    paddingVertical: SPACING.sm + 4,
    marginRight: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.blue,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  activeTabText: {
    color: COLORS.blue,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
    minHeight: 200,
  },
  transactionsList: {
    gap: SPACING.xs,
  },
  emptyState: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray500,
    textAlign: 'center',
    paddingTop: SPACING.xl,
  },
  txnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  txnLeft: {},
  txnDate: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  txnSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
  },
  txnPrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  txnPsf: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.blue,
    fontWeight: '600',
  },
  listContainer: {
    gap: SPACING.xs,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  listLeft: {
    flex: 1,
  },
  listTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  listSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  listDistance: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.blue,
  },
  aiSummaryCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    } as any),
  },
  aiSummaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  aiSummaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  aiButton: {
    backgroundColor: COLORS.blue,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  aiButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  footer: {
    height: 40,
  },
});
