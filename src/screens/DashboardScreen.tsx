import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  formatCurrency,
  formatDate,
  calculateTotals,
  getExpensesByCategory,
  filterTransactionsByPeriod,
  formatTimePeriod,
} from '../utils/finance';
import { getIcon } from '../components/IconMap';
import { EmptyState } from '../components/EmptyState';
import { AppHeader } from '../components/AppHeader';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';
import { TimePeriod } from '../types/finance';

const PERIODS: TimePeriod[] = ['this-week', 'last-week', 'this-month', 'last-month', 'all'];

export function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { transactions, categories, quickAddCategoryIds } = useFinance();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('this-month');
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  const filtered = useMemo(
    () => filterTransactionsByPeriod(transactions, timePeriod),
    [transactions, timePeriod]
  );
  const totals = useMemo(() => calculateTotals(filtered), [filtered]);
  const recent = useMemo(() => filtered.slice(0, 5), [filtered]);
  const byCategory = useMemo(() => getExpensesByCategory(filtered), [filtered]);
  const quickCategories = useMemo(() => {
    if (quickAddCategoryIds.length > 0) {
      return quickAddCategoryIds
        .map((id) => categories.find((c) => c.id === id))
        .filter((c): c is NonNullable<typeof c> => c != null);
    }
    return categories.filter((c) => c.type === 'expense').slice(0, 4);
  }, [categories, quickAddCategoryIds]);

  const openAddEntry = useCallback(
    (categoryId?: string) => {
      navigation.navigate('AddEntry', { preSelectedCategoryId: categoryId });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <AppHeader />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header summary */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity
            style={styles.periodButton}
            onPress={() => setShowPeriodModal(true)}
          >
            <Text style={styles.periodButtonText}>{formatTimePeriod(timePeriod)}</Text>
            <Text style={styles.periodChevron}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balance}>
            {formatCurrency(totals.balance)}
          </Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconWrapIncome}>
                <Text style={styles.summaryArrow}>↑</Text>
              </View>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.income)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconWrapExpense}>
                <Text style={styles.summaryArrowDown}>↓</Text>
              </View>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totals.expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Quick add */}
        {quickCategories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Add</Text>
            <View style={styles.quickGrid}>
              {quickCategories.map((cat) => {
                const Icon = getIcon(cat.icon || 'Circle');
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.quickItem}
                    onPress={() => openAddEntry(cat.id)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.quickIconWrap,
                        { backgroundColor: `${cat.color}25` },
                      ]}
                    >
                      <Icon size={24} color={cat.color} />
                    </View>
                    <Text style={styles.quickLabel} numberOfLines={1}>
                      {cat.name.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Spending by category */}
        {byCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spending by Category</Text>
            <View style={styles.categoryCard}>
              {byCategory.slice(0, 5).map(({ category, amount, percentage }) => {
                const Icon = getIcon(category.icon || 'Circle');
                return (
                  <View key={category.id} style={styles.categoryRow}>
                    <View style={styles.categoryRowLeft}>
                      <Icon size={16} color={category.color} />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                    <View style={styles.progressWrap}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(100, percentage)}%`,
                            backgroundColor: category.color,
                          },
                        ]}
                      />
                      <Text style={styles.progressPct}>{percentage.toFixed(0)}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent transactions */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {transactions.length > 5 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>
          {recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <EmptyState
                iconName="Wallet"
                title="No transactions yet"
                description="Start tracking your finances by adding your first transaction"
                action={{ label: 'Add Transaction', onPress: () => openAddEntry() }}
              />
            </View>
          ) : (
            <View style={styles.recentCard}>
              {recent.map((t) => {
                const Icon = getIcon(t.category.icon || 'Circle');
                return (
                  <View key={t.id} style={styles.recentRow}>
                    <View
                      style={[
                        styles.recentIconWrap,
                        { backgroundColor: `${t.category.color}20` },
                      ]}
                    >
                      <Icon size={24} color={t.category.color} />
                    </View>
                    <View style={styles.recentContent}>
                      <Text style={styles.recentCategory}>{t.category.name}</Text>
                      <Text style={styles.recentDate}>{formatDate(t.date)}</Text>
                    </View>
                    <Text
                      style={[
                        styles.recentAmount,
                        t.type === 'income' ? styles.amountIncome : styles.amountExpense,
                      ]}
                    >
                      {t.type === 'income' ? '+' : '-'}
                      {formatCurrency(t.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => openAddEntry()}
        activeOpacity={0.9}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Period modal */}
      <Modal visible={showPeriodModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPeriodModal(false)}
        >
          <View style={styles.modalContent}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.modalOption}
                onPress={() => {
                  setTimePeriod(p);
                  setShowPeriodModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{formatTimePeriod(p)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    paddingTop: 12,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  periodButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  periodChevron: { color: colors.white, fontSize: 10, marginLeft: 4 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balance: { color: colors.white, fontSize: 28, fontWeight: '700', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
  },
  summaryIconWrapIncome: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryIconWrapExpense: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220,38,38,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryArrow: { color: colors.income, fontSize: 16, fontWeight: '700' },
  summaryArrowDown: { color: colors.expense, fontSize: 16, fontWeight: '700' },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 },
  summaryValue: { color: colors.white, fontSize: 18, fontWeight: '700' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickItem: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: '500', color: colors.text, maxWidth: 60, textAlign: 'center' },
  categoryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryRow: { marginBottom: 14 },
  categoryRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  categoryName: { fontSize: 14, fontWeight: '500', color: colors.text },
  categoryAmount: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressFill: { height: 8, borderRadius: 4, flex: 1 },
  progressPct: { fontSize: 12, color: colors.textSecondary, width: 36, textAlign: 'right' },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recentIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentContent: { flex: 1 },
  recentCategory: { fontWeight: '600', fontSize: 16, color: colors.text },
  recentDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  recentAmount: { fontSize: 17, fontWeight: '700' },
  amountIncome: { color: colors.income },
  amountExpense: { color: colors.expense },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { color: colors.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  modalOption: { padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
});
