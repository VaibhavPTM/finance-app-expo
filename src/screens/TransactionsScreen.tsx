import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  groupTransactionsByDate,
  formatDate,
  filterTransactionsByPeriod,
  formatTimePeriod,
} from '../utils/finance';
import { TransactionItem } from '../components/TransactionItem';
import { EmptyState } from '../components/EmptyState';
import { useFinance } from '../context/FinanceContext';
import { getIcon } from '../components/IconMap';
import { colors } from '../theme';
import { FilterOptions, TimePeriod } from '../types/finance';

const SORT_OPTIONS: { value: FilterOptions['sortBy']; label: string }[] = [
  { value: 'date-newest', label: 'Newest First' },
  { value: 'date-oldest', label: 'Oldest First' },
  { value: 'amount-highest', label: 'Highest Amount' },
  { value: 'amount-lowest', label: 'Lowest Amount' },
];

const PERIODS: TimePeriod[] = ['all', 'this-week', 'last-week', 'this-month', 'last-month'];

export function TransactionsScreen() {
  const navigation = useNavigation<any>();
  const { transactions, categories, paymentMethods, deleteTransaction } = useFinance();
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date-newest',
    timePeriod: 'all',
    searchQuery: '',
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  let list = filterTransactionsByPeriod(transactions, filters.timePeriod);
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(
      (t) =>
        t.category.name.toLowerCase().includes(q) ||
        (t.notes?.toLowerCase().includes(q)) ||
        t.paymentMethod.name.toLowerCase().includes(q)
    );
  }
  if (filters.categoryId && filters.categoryId !== 'all') {
    list = list.filter((t) => t.category.id === filters.categoryId);
  }
  if (filters.paymentMethodId && filters.paymentMethodId !== 'all') {
    list = list.filter((t) => t.paymentMethod.id === filters.paymentMethodId);
  }
  list = [...list].sort((a, b) => {
    switch (filters.sortBy) {
      case 'date-newest':
        return b.date.getTime() - a.date.getTime();
      case 'date-oldest':
        return a.date.getTime() - b.date.getTime();
      case 'amount-highest':
        return b.amount - a.amount;
      case 'amount-lowest':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const grouped = groupTransactionsByDate(list);
  const sortedDates = Array.from(grouped.keys()).sort((a, b) =>
    filters.sortBy.startsWith('date-newest') ? b.localeCompare(a) : a.localeCompare(b)
  );

  const activeFilters =
    (filters.categoryId && filters.categoryId !== 'all' ? 1 : 0) +
    (filters.paymentMethodId && filters.paymentMethodId !== 'all' ? 1 : 0);

  const openAddEntry = () => {
    navigation.navigate('AddEntry', {});
  };

  const handleEdit = (t: any) => {
    navigation.navigate('AddEntry', { editId: t.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>

        <TouchableOpacity style={styles.periodBtn} onPress={() => setShowFilterModal(true)}>
          <Text style={styles.periodBtnText}>{formatTimePeriod(filters.timePeriod)}</Text>
          <Text style={styles.chevron}>▼</Text>
        </TouchableOpacity>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.textMuted}
            value={filters.searchQuery}
            onChangeText={(q) => setFilters((f) => ({ ...f, searchQuery: q }))}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSortModal(true)}>
            <Text style={styles.sortBtnText}>
              {SORT_OPTIONS.find((o) => o.value === filters.sortBy)?.label}
            </Text>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
            onPress={() => setShowFilterModal(true)}
          >
            <Text style={styles.filterBtnText}>Filters</Text>
            {activeFilters > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {list.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="Wallet"
            title={
              filters.searchQuery || filters.categoryId || filters.paymentMethodId
                ? 'No results found'
                : 'No transactions yet'
            }
            description={
              filters.searchQuery || filters.categoryId || filters.paymentMethodId
                ? 'Try adjusting your filters or search query'
                : 'Start tracking your finances by adding your first transaction'
            }
            action={
              !filters.searchQuery && !filters.categoryId && !filters.paymentMethodId
                ? { label: 'Add Transaction', onPress: openAddEntry }
                : undefined
            }
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedDates.map((dateKey) => {
            const dayTransactions = grouped.get(dateKey) || [];
            const first = dayTransactions[0];
            if (!first) return null;
            return (
              <View key={dateKey} style={styles.dayGroup}>
                <Text style={styles.dayTitle}>{formatDate(first.date)}</Text>
                {dayTransactions.map((t) => (
                  <TransactionItem
                    key={t.id}
                    transaction={t}
                    onEdit={handleEdit}
                    onDelete={deleteTransaction}
                  />
                ))}
              </View>
            );
          })}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Sort modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.modalOption}
                onPress={() => {
                  setFilters((f) => ({ ...f, sortBy: opt.value }));
                  setShowSortModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Filter modal (period + category + payment) */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Text style={styles.modalLabel}>Time period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {PERIODS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, filters.timePeriod === p && styles.chipActive]}
                  onPress={() => setFilters((f) => ({ ...f, timePeriod: p }))}
                >
                  <Text style={[styles.chipText, filters.timePeriod === p && styles.chipTextActive]}>
                    {formatTimePeriod(p)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[styles.chip, (!filters.categoryId || filters.categoryId === 'all') && styles.chipActive]}
                onPress={() => setFilters((f) => ({ ...f, categoryId: undefined }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    (!filters.categoryId || filters.categoryId === 'all') && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, filters.categoryId === c.id && styles.chipActive]}
                  onPress={() => setFilters((f) => ({ ...f, categoryId: c.id }))}
                >
                  <Text style={[styles.chipText, filters.categoryId === c.id && styles.chipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Payment method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  (!filters.paymentMethodId || filters.paymentMethodId === 'all') && styles.chipActive,
                ]}
                onPress={() => setFilters((f) => ({ ...f, paymentMethodId: undefined }))}
              >
                <Text
                  style={[
                    styles.chipText,
                    (!filters.paymentMethodId || filters.paymentMethodId === 'all') && styles.chipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {paymentMethods.map((pm) => (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.chip, filters.paymentMethodId === pm.id && styles.chipActive]}
                  onPress={() => setFilters((f) => ({ ...f, paymentMethodId: pm.id }))}
                >
                  <Text
                    style={[styles.chipText, filters.paymentMethodId === pm.id && styles.chipTextActive]}
                  >
                    {pm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {activeFilters > 0 && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() =>
                  setFilters((f) => ({
                    ...f,
                    categoryId: undefined,
                    paymentMethodId: undefined,
                  }))
                }
              >
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 12 },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  periodBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  chevron: { fontSize: 10, color: colors.textSecondary, marginLeft: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: colors.text },
  filterRow: { flexDirection: 'row', gap: 10 },
  sortBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sortBtnText: { fontSize: 14, color: colors.text },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    position: 'relative',
  },
  filterBtnActive: { borderWidth: 2, borderColor: colors.primary },
  filterBtnText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  emptyWrap: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 16, paddingBottom: 32 },
  dayGroup: { marginBottom: 20 },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginHorizontal: 20,
    paddingLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: colors.card, borderRadius: 16, overflow: 'hidden' },
  modalOption: { padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  chipScroll: { marginBottom: 16, maxHeight: 44 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  chipTextActive: { color: colors.white },
  clearBtn: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  clearBtnText: { color: colors.expense, fontWeight: '600', fontSize: 15 },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
