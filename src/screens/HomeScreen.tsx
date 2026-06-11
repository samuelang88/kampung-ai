import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../utils/colors';
import { singaporeTowns } from '../services/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const POPULAR_TOWNS = [
  'Tiong Bahru',
  'Queenstown',
  'Bishan',
  'Toa Payoh',
  'Clementi',
];

const FEATURES = [
  {
    icon: '📊',
    title: 'AI Valuation Estimate',
    subtitle: 'Powered by machine learning models trained on 50K+ transactions',
    route: 'Valuation' as const,
    params: { projectName: 'Changi Heights' },
  },
  {
    icon: '🏗️',
    title: 'Compare Projects',
    subtitle: 'Side-by-side analysis of HDB and private properties',
    route: 'Property' as const,
    params: { projectName: 'The Interlace' },
  },
  {
    icon: '🚇',
    title: 'Nearby MRT',
    subtitle: 'Proximity analysis to MRT stations and transport hubs',
    route: 'Property' as const,
    params: { projectName: 'Marina One Residences' },
  },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: '🔍',
    title: 'Search',
    description: 'Enter an HDB block, town, or private project name to get started.',
  },
  {
    step: '2',
    icon: '🤖',
    title: 'AI Analysis',
    description:
      'Our models analyze recent transactions, lease decay, location factors, and market trends.',
  },
  {
    step: '3',
    icon: '📄',
    title: 'Report',
    description:
      'Receive a comprehensive valuation report with confidence range and actionable insights.',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [showTownDropdown, setShowTownDropdown] = useState(false);
  const [filteredTowns, setFilteredTowns] = useState<string[]>([]);

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const filtered = singaporeTowns.filter((t) =>
        t.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredTowns(filtered);
      setShowTownDropdown(true);
    } else {
      setFilteredTowns([]);
      setShowTownDropdown(false);
    }
  };

  const selectTown = (town: string) => {
    setSearchText(town);
    setShowTownDropdown(false);
    // Navigate to valuation with town as context
    navigation.navigate('Valuation', { projectName: town });
  };

  const handlePopularTown = (town: string) => {
    setSearchText(town);
    navigation.navigate('Valuation', { projectName: town });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>
          Find your property's true value
        </Text>
        <Text style={styles.searchSubtitle}>
          AI-powered HDB & private property valuation for Singapore
        </Text>
        <View style={styles.searchWrapper}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by town, block, or project..."
              placeholderTextColor={COLORS.gray500}
              value={searchText}
              onChangeText={handleSearchChange}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText('');
                  setShowTownDropdown(false);
                }}
              >
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Town dropdown */}
          {showTownDropdown && filteredTowns.length > 0 && (
            <View style={styles.dropdown}>
              <ScrollView
                style={styles.dropdownScroll}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {filteredTowns.map((town) => (
                  <TouchableOpacity
                    key={town}
                    style={styles.dropdownItem}
                    onPress={() => selectTown(town)}
                  >
                    <Text style={styles.dropdownText}>{town}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Popular Searches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Searches</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {POPULAR_TOWNS.map((town) => (
            <TouchableOpacity
              key={town}
              style={styles.chip}
              onPress={() => handlePopularTown(town)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipText}>{town}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feature Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        {FEATURES.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.featureCard}
            onPress={() =>
              navigation.navigate(feature.route, feature.params as any)
            }
            activeOpacity={0.7}
          >
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
            </View>
            <Text style={styles.featureArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepsContainer}>
          {HOW_IT_WORKS.map((item, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepIconContainer}>
                <Text style={styles.stepIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* About link */}
      <TouchableOpacity
        style={styles.aboutLink}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={styles.aboutLinkText}>About Kampung.ai</Text>
        <Text style={styles.aboutLinkArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  searchSection: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  searchTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  searchSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.lg,
  },
  searchWrapper: {
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.gray900,
  },
  clearButton: {
    fontSize: 18,
    color: COLORS.gray500,
    padding: SPACING.xs,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xs,
    maxHeight: 220,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    } as any),
  },
  dropdownScroll: {
    maxHeight: 220,
    paddingVertical: SPACING.xs,
  },
  dropdownItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray200,
  },
  dropdownText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray800,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingBottom: SPACING.xs,
  },
  chip: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md + 4,
    paddingVertical: SPACING.sm + 4,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.blue,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    } as any),
  },
  featureIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  featureArrow: {
    fontSize: 24,
    color: COLORS.gray400,
    marginLeft: SPACING.sm,
  },
  stepsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stepCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 1,
    } as any),
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  stepIcon: {
    fontSize: 22,
  },
  stepTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 16,
  },
  aboutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  aboutLinkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.blue,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  aboutLinkArrow: {
    fontSize: 20,
    color: COLORS.blue,
  },
  footer: {
    height: 40,
  },
});
