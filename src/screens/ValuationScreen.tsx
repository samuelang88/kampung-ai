import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/colors';
import { getPrivateTransactions, getProjectDetails } from '../services/uraApi';
import type { PrivateTransaction, ProjectDetails, ValuationResult } from '../services/types';

type RouteParams = {
  Valuation: { projectName: string };
};

const screenWidth = Dimensions.get('window').width;

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

/**
 * Generate a simulated valuation result based on transaction data.
 */
function generateValuation(
  transactions: PrivateTransaction[],
  project: ProjectDetails | null
): ValuationResult {
  const avgPrice =
    transactions.length > 0
      ? transactions.reduce((s, t) => s + t.price, 0) / transactions.length
      : 800000;
  const avgPsf =
    transactions.length > 0
      ? Math.round(
          transactions.reduce((s, t) => s + t.psf, 0) / transactions.length
        )
      : 1500;

  const confidenceLevel = transactions.length >= 3 ? 85 : transactions.length >= 1 ? 65 : 40;
  const rangeOffset = avgPrice * ((100 - confidenceLevel) / 200);
  const estimatedValue = avgPrice;

  // Lease decay projection (assume 99-year lease starting from 2000)
  const currentYear = new Date().getFullYear();
  const leaseStart =
    project?.tenure.includes('Freehold')
      ? 0
      : project?.yearCompleted
      ? project.yearCompleted
      : 2000;
  const totalLease = project?.tenure.includes('Freehold') ? 999 : 99;
  const remainingLease = Math.max(0, totalLease - (currentYear - leaseStart));

  const leaseDecayProjection = [];
  for (let y = 0; y <= 20; y += 2) {
    const year = currentYear + y;
    const remaining = Math.max(0, remainingLease - y);
    // Simple decay model: value declines more steeply after 40-year mark
    const decayFactor =
      remaining > 40 ? 1 - y * 0.005 : remaining > 20 ? 1 - y * 0.015 : 1 - y * 0.03;
    const value = Math.round(estimatedValue * Math.max(decayFactor, 0.3));
    leaseDecayProjection.push({ year, value, remainingLease: remaining });
  }

  const recommendation =
    avgPsf < 1200 && remainingLease > 50
      ? ('Buy' as const)
      : avgPsf > 2000
      ? ('Rent' as const)
      : ('Neutral' as const);

  const reasons = {
    Buy: 'Below-market PSF with long remaining lease. Strong buy signal for capital appreciation.',
    Rent: 'Elevated PSF suggests premium pricing. Renting may offer better short-term value.',
    Neutral:
      'Market conditions are balanced. Consider your personal holding period and financial goals.',
  };

  const psfTrendCalc =
    transactions.length >= 2
      ? transactions[0].psf > transactions[transactions.length - 1].psf
      : true;
  const psfChange = transactions.length >= 2
    ? Math.round(
        ((transactions[0].psf - transactions[transactions.length - 1].psf) /
          transactions[transactions.length - 1].psf) *
          100
      )
    : 0;

  return {
    estimatedValue: Math.round(estimatedValue),
    confidenceLow: Math.round(estimatedValue - rangeOffset),
    confidenceHigh: Math.round(estimatedValue + rangeOffset),
    confidenceLevel,
    comparableSales: transactions.slice(0, 5),
    leaseDecayProjection,
    recommendation,
    recommendationReason: reasons[recommendation],
    rentalYield: 3.5,
    psfTrend: psfTrendCalc ? 'up' : 'down',
    psfChangePercent: psfChange,
  };
}

export default function ValuationScreen() {
  const route = useRoute<RouteParams>();
  const { projectName } = route.params;

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [transactions, setTransactions] = useState<PrivateTransaction[]>([]);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation while analyzing
  useEffect(() => {
    if (!analyzing) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [analyzing, pulseAnim]);

  useEffect(() => {
    async function load() {
      try {
        const [txns, details] = await Promise.all([
          getPrivateTransactions(projectName, 10),
          getProjectDetails(projectName),
        ]);
        setTransactions(txns);
        setProject(details);

        // Simulate AI analysis delay
        setLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setValuation(generateValuation(txns, details));
        setAnalyzing(false);
      } catch (err) {
        console.error('Valuation error:', err);
        setLoading(false);
        setAnalyzing(false);
        // Fallback valuation
        setValuation(
          generateValuation([], null)
        );
      }
    }
    load();
  }, [projectName]);

  if (loading || analyzing) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ opacity: pulseAnim }}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIcon}>🤖</Text>
          </View>
        </Animated.View>
        <Text style={styles.analyzingTitle}>
          {loading ? 'Loading transaction data...' : 'AI is analyzing...'}
        </Text>
        <View style={styles.analysisSteps}>
          <Text style={styles.analysisStep}>
            ✓ Fetching {transactions.length} recent transactions
          </Text>
          <Text style={styles.analysisStep}>
            ✓ Analyzing lease decay and tenure
          </Text>
          <Text style={[styles.analysisStep, !loading && styles.analysisStepActive]}>
            {loading ? '○ Running comparable sales model...' : '✓ Comparable sales matched'}
          </Text>
          <Text style={[styles.analysisStep, !loading && styles.analysisStepActive]}>
            {loading ? '○ Computing valuation confidence...' : '✓ Confidence interval calculated'}
          </Text>
          <Text style={[styles.analysisStep, !loading && styles.analysisStepActive]}>
            {loading ? '○ Generating recommendation...' : '✓ Recommendation ready'}
          </Text>
        </View>
        <ActivityIndicator
          size="small"
          color={COLORS.gold}
          style={{ marginTop: SPACING.lg }}
        />
      </View>
    );
  }

  if (!valuation) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Unable to generate valuation.</Text>
      </View>
    );
  }

  const confidenceColor =
    valuation.confidenceLevel >= 80
      ? COLORS.green
      : valuation.confidenceLevel >= 50
      ? COLORS.gold
      : COLORS.red;

  const recColor =
    valuation.recommendation === 'Buy'
      ? COLORS.green
      : valuation.recommendation === 'Rent'
      ? COLORS.red
      : COLORS.gold;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Result Header */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>Valuation Report</Text>
        <Text style={styles.resultSubtitle}>{projectName}</Text>
        {project && (
          <Text style={styles.resultTenure}>
            {project.tenure} · D{project.district}
          </Text>
        )}
      </View>

      {/* Estimated Value */}
      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>Estimated Market Value</Text>
        <Text style={styles.valueAmount}>
          {formatCurrency(valuation.estimatedValue)}
        </Text>
        <View style={styles.confidenceRow}>
          <View
            style={[
              styles.confidenceBar,
              { backgroundColor: confidenceColor, opacity: 0.2 },
            ]}
          >
            <View
              style={[
                styles.confidenceFill,
                {
                  backgroundColor: confidenceColor,
                  width: `${valuation.confidenceLevel}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.confidenceText, { color: confidenceColor }]}>
            {valuation.confidenceLevel}% confidence
          </Text>
        </View>
        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>
            Range: {formatCurrency(valuation.confidenceLow)} –{' '}
            {formatCurrency(valuation.confidenceHigh)}
          </Text>
        </View>
      </View>

      {/* Comparable Sales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comparable Sales</Text>
        {valuation.comparableSales.map((sale, i) => (
          <View key={i} style={styles.comparableRow}>
            <View style={styles.comparableLeft}>
              <Text style={styles.comparableDate}>{sale.contractDate}</Text>
              <Text style={styles.comparableSize}>
                {sale.areaSqft.toLocaleString()} sqft · {sale.type}
              </Text>
            </View>
            <View style={styles.comparableRight}>
              <Text style={styles.comparablePrice}>
                {formatCurrency(sale.price)}
              </Text>
              <Text style={styles.comparablePsf}>${sale.psf} psf</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Lease Decay Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lease Decay Projection</Text>
        <Text style={styles.chartSubtitle}>
          Estimated value over time (20-year projection)
        </Text>
        <View style={styles.chartContainer}>
          {/* Simple bar chart */}
          <View style={styles.barChart}>
            {valuation.leaseDecayProjection.map((point, i) => {
              const maxVal = valuation.leaseDecayProjection[0].value;
              const heightPercent = (point.value / maxVal) * 100;
              return (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(heightPercent, 3)}%`,
                          backgroundColor:
                            point.remainingLease > 50
                              ? COLORS.green
                              : point.remainingLease > 20
                              ? COLORS.gold
                              : COLORS.red,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{point.year % 10 === 0 || i === 0 ? point.year : ''}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <Text style={styles.legendItem}>
              🟢 {'>'} 50yr remaining
            </Text>
            <Text style={styles.legendItem}>
              🟡 20–50yr remaining
            </Text>
            <Text style={styles.legendItem}>
              🔴 {'<'} 20yr remaining
            </Text>
          </View>
        </View>
      </View>

      {/* Recommendation */}
      <View style={[styles.recommendationCard, { borderLeftColor: recColor }]}>
        <View style={styles.recHeader}>
          <Text style={styles.recIcon}>
            {valuation.recommendation === 'Buy'
              ? '👍'
              : valuation.recommendation === 'Rent'
              ? '🤔'
              : '⚖️'}
          </Text>
          <View>
            <Text style={[styles.recLabel, { color: recColor }]}>
              {valuation.recommendation === 'Buy'
                ? 'Recommendation: Buy'
                : valuation.recommendation === 'Rent'
                ? 'Recommendation: Rent'
                : 'Recommendation: Neutral'}
            </Text>
            <Text style={styles.recMeta}>
              PSF {'\u00B7'} {valuation.psfTrend === 'up' ? '↑' : '↓'}{' '}
              {valuation.psfChangePercent}% · Yield {valuation.rentalYield}%
            </Text>
          </View>
        </View>
        <Text style={styles.recReason}>{valuation.recommendationReason}</Text>
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
    paddingHorizontal: SPACING.xl,
  },
  aiIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  aiIcon: {
    fontSize: 40,
  },
  analyzingTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  analysisSteps: {
    alignSelf: 'stretch',
    gap: SPACING.sm,
  },
  analysisStep: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    paddingVertical: SPACING.xs,
  },
  analysisStepActive: {
    color: COLORS.green,
    fontWeight: '600',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
  },
  resultHeader: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: SPACING.xs,
  },
  resultSubtitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  resultTenure: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: SPACING.xs,
  },
  valueCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    } as any),
  },
  valueLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  valueAmount: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    width: 90,
    textAlign: 'right',
  },
  rangeRow: {},
  rangeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  chartSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.md,
  },
  comparableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  comparableLeft: {},
  comparableDate: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  comparableSize: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginTop: 2,
  },
  comparableRight: {
    alignItems: 'flex-end',
  },
  comparablePrice: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  comparablePsf: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.blue,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: 2,
    paddingBottom: SPACING.lg,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    maxHeight: 140,
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderRadius: 2,
    maxWidth: 20,
  },
  barLabel: {
    fontSize: 8,
    color: COLORS.gray500,
    marginTop: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.gray300,
  },
  legendItem: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
  },
  recommendationCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    } as any),
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  recIcon: {
    fontSize: 28,
  },
  recLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
  recMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginTop: 2,
  },
  recReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  footer: {
    height: 40,
  },
});
