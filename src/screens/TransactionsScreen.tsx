import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SectionList,
  ScrollView,
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
import { useTheme } from '../context/ThemeContext';
import { AppHeader } from '../components/AppHeader';
import { colors as staticColors } from '../theme';
import { FilterOptions, TimePeriod, Transaction, TransactionTypeFilter } from '../types/finance';

const SORT_OPTIONS: { value: FilterOptions['sortBy']; label: string }[] = [
  { value: 'date-newest', label: 'Newest First' },
  { value: 'date-oldest', label: 'Oldest First' },
  { value: 'amount-highest', label: 'Highest Amount' },
  { value: 'amount-lowest', label: 'Lowest Amount' },
];

const PERIODS: TimePeriod[] = ['all', 'this-week', 'last-week', 'this-month', 'last-month'];

const TYPE_FILTERS: { value: TransactionTypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

type Section = { title: string; dateKey: string; data: Transaction[] };

export function TransactionsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { transactions, categories, paymentMethods, deleteTransaction } = useFinance();
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date-newest',
    timePeriod: 'all',
    searchQuery: '',
    transactionType: 'all' as TransactionTypeFilter,
  });
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const sections = useMemo(() => {
    let list = filterTransactionsByPeriod(transactions, filters.timePeriod);
    if (filters.transactionType && filters.transactionType !== 'all') {
      list = list.filter((t) => t.type === filters.transactionType);
    }
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
      filters.sortBy?.startsWith('date-newest') ? b.localeCompare(a) : a.localeCompare(b)
    );
    return sortedDates.map((dateKey) => {
      const data = grouped.get(dateKey) || [];
      const first = data[0];
      return {
        title: first ? formatDate(first.date) : dateKey,
        dateKey,
        data,
      };
    }).filter((s) => s.data.length > 0);
  }, [transactions, filters]);

  const activeFilters =
    (filters.categoryId && filters.categoryId !== 'all' ? 1 : 0) +
    (filters.paymentMethodId && filters.paymentMethodId !== 'all' ? 1 : 0) +
    (filters.transactionType && filters.transactionType !== 'all' ? 1 : 0);

  const openAddEntry = useCallback(() => {
    navigation.navigate('AddEntry', {});
  }, [navigation]);

  const handleEdit = useCallback(
    (t: Transaction) => {
      navigation.navigate('AddEntry', { editId: t.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        transaction={item}
        onEdit={handleEdit}
        onDelete={deleteTransaction}
      />
    ),
    [handleEdit, deleteTransaction]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.dayTitle}>{section.title}</Text>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const listEmpty = sections.length === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Transactions" />
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>

        <View style={styles.typeRow}>
          {TYPE_FILTERS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.typeChip, filters.transactionType === opt.value && styles.typeChipActive]}
              onPress={() => setFilters((f) => ({ ...f, transactionType: opt.value }))}
            >
              <Text
                style={[
                  styles.typeChipText,
                  filters.transactionType === opt.value && styles.typeChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
            value={filters.searchQuery || ''}
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

      {listEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            iconName="Wallet"
            title={
              filters.searchQuery ||
              filters.categoryId ||
              filters.paymentMethodId ||
              (filters.transactionType && filters.transactionType !== 'all')
                ? 'No results found'
                : 'No transactions yet'
            }
            description={
              filters.searchQuery ||
              filters.categoryId ||
              filters.paymentMethodId ||
              (filters.transactionType && filters.transactionType !== 'all')
                ? 'Try adjusting your filters or search query'
                : 'Start tracking your finances by adding your first transaction'
            }
            action={
              !filters.searchQuery &&
              !filters.categoryId &&
              !filters.paymentMethodId &&
              (!filters.transactionType || filters.transactionType === 'all')
                ? { label: 'Add Transaction', onPress: openAddEntry }
                : undefined
            }
          />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={12}
          windowSize={8}
          initialNumToRender={10}
        />
      )}

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
                    (!filters.paymentMethodId || filters.paymentMethodId === 'all') &&
                      styles.chipTextActive,
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
                    style={[
                      styles.chipText,
                      filters.paymentMethodId === pm.id && styles.chipTextActive,
                    ]}
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
                    transactionType: 'all',
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
  container: { flex: 1, backgroundColor: staticColors.background },
  header: {
    backgroundColor: staticColors.card,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', color: staticColors.text, marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: staticColors.background,
  },
  typeChipActive: { backgroundColor: staticColors.primary },
  typeChipText: { fontSize: 14, fontWeight: '600', color: staticColors.text },
  typeChipTextActive: { color: staticColors.white },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  periodBtnText: { fontSize: 14, fontWeight: '600', color: staticColors.text },
  chevron: { fontSize: 10, color: staticColors.textSecondary, marginLeft: 4 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: staticColors.text },
  filterRow: { flexDirection: 'row', gap: 10 },
  sortBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: staticColors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sortBtnText: { fontSize: 14, color: staticColors.text },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    position: 'relative',
  },
  filterBtnActive: { borderWidth: 2, borderColor: staticColors.primary },
  filterBtnText: { fontSize: 14, color: staticColors.text, fontWeight: '500' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: staticColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: staticColors.white, fontSize: 11, fontWeight: '700' },
  emptyWrap: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingVertical: 16, paddingBottom: 100 },
  sectionHeader: { marginBottom: 8, marginHorizontal: 20, paddingLeft: 4 },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: staticColors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: { backgroundColor: staticColors.card, borderRadius: 16, overflow: 'hidden' },
  modalOption: { padding: 18, borderBottomWidth: 1, borderBottomColor: staticColors.border },
  modalOptionText: { fontSize: 16, color: staticColors.text, fontWeight: '500' },
  modalSheet: {
    backgroundColor: staticColors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: staticColors.text, marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: staticColors.textSecondary, marginBottom: 10 },
  chipScroll: { marginBottom: 16, maxHeight: 44 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: staticColors.background,
    marginRight: 8,
  },
  chipActive: { backgroundColor: staticColors.primary },
  chipText: { fontSize: 14, color: staticColors.text, fontWeight: '500' },
  chipTextActive: { color: staticColors.white },
  clearBtn: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  clearBtnText: { color: staticColors.expense, fontWeight: '600', fontSize: 15 },
  doneBtn: {
    backgroundColor: staticColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneBtnText: { color: staticColors.white, fontWeight: '700', fontSize: 16 },
});
