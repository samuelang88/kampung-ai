import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/colors';

const TEAM_MEMBERS = [
  {
    name: 'Wei Ming Tan',
    role: 'Founder & CEO',
    bio: 'Former HDB data analyst with a vision to democratize property valuation using AI. 10 years in Singapore\'s real estate analytics space.',
  },
  {
    name: 'Priya Krishnan',
    role: 'CTO',
    bio: 'AI/ML engineer specialized in regression models for property valuation. Previously built valuation engines for PropNex.',
  },
  {
    name: 'Marcus Lim',
    role: 'Head of Product',
    bio: 'Ex-99.co product lead who understands what home buyers and sellers need from a valuation tool.',
  },
];

const DATA_SOURCES = [
  {
    icon: '🏛️',
    name: 'data.gov.sg',
    description: 'Official HDB Resale Price datasets — 50K+ transaction records from 2017 to present, updated quarterly.',
  },
  {
    icon: '📋',
    name: 'URA Data Service',
    description: 'Private property transaction data via URA\'s developer API — covering condos, apartments, and landed properties.',
  },
  {
    icon: '📍',
    name: 'OneMap API',
    description: 'Singapore Land Authority\'s geospatial service for MRT proximity, school catchment zones, and amenity mapping.',
  },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <Text style={styles.brandName}>Kampung.ai</Text>
        <Text style={styles.tagline}>Smart Valuation for Every Home</Text>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>
      </View>

      {/* Mission */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.bodyText}>
          At Kampung.ai, we believe every Singaporean deserves access to
          transparent, data-driven property valuations. Whether you're buying
          your first HDB flat, upgrading to a condo, or evaluating your
          investment portfolio, our AI-powered platform gives you the insights
          you need to make confident decisions.
        </Text>
        <Text style={styles.bodyText}>
          "Kampung" means "village" in Malay — a nod to the heartland
          communities we serve. We combine machine learning with official
          government data to bring institutional-grade valuation to every
          smartphone.
        </Text>
      </View>

      {/* Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meet the Team</Text>
        {TEAM_MEMBERS.map((member, i) => (
          <View key={i} style={styles.teamCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {member.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{member.name}</Text>
              <Text style={styles.teamRole}>{member.role}</Text>
              <Text style={styles.teamBio}>{member.bio}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Data Sources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Sources</Text>
        <Text style={styles.bodyText}>
          Kampung.ai aggregates data from official Singapore government sources
          and proprietary models to deliver accurate valuations.
        </Text>
        {DATA_SOURCES.map((source, i) => (
          <View key={i} style={styles.sourceCard}>
            <Text style={styles.sourceIcon}>{source.icon}</Text>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceDesc}>{source.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactCard}>
          <Text style={styles.contactItem}>📧 hello@kampung.ai</Text>
          <Text style={styles.contactItem}>📱 +65 8123 4567</Text>
          <Text style={styles.contactItem}>
            🌐 www.kampung.ai
          </Text>
        </View>
        <Text style={styles.address}>
          79 Robinson Road, #15-01,{'\n'}Singapore 068897
        </Text>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          Kampung.ai provides estimated property valuations for informational
          purposes only. These estimates do not constitute professional valuation
          advice. Always consult a licensed valuer or property agent before
          making real estate decisions. Transaction data is sourced from public
          government datasets and may not reflect off-market transactions.
        </Text>
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
  brandHeader: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  brandName: {
    fontSize: FONT_SIZES.title,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  versionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  bodyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  teamCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    } as any),
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.white,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  teamRole: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  teamBio: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  sourceCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sourceIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
    marginTop: 2,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 2,
  },
  sourceDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  contactItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray800,
    paddingVertical: SPACING.xs,
  },
  address: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
  },
  disclaimer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  disclaimerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  disclaimerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  footer: {
    height: 40,
  },
});
