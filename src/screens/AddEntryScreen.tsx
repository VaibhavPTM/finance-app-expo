import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { getIcon } from '../components/IconMap';
import { AppHeader } from '../components/AppHeader';
import { getCategoriesGroupedByMain } from '../utils/finance';
import { colors } from '../theme';
import { Transaction, TransactionType, Category, PaymentMethod } from '../types/finance';

type AddEntryRoute = { AddEntry: { editId?: string; preSelectedCategoryId?: string } };

export function AddEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AddEntryRoute, 'AddEntry'>>();
  const editId = route.params?.editId;
  const preSelectedCategoryId = route.params?.preSelectedCategoryId;

  const { colors } = useTheme();
  const { transactions, categories, paymentMethods, addTransaction, updateTransaction } = useFinance();
  const editing = transactions.find((t) => t.id === editId);
  const preSelectedCategory = preSelectedCategoryId
    ? categories.find((c) => c.id === preSelectedCategoryId)
    : null;

  const [type, setType] = useState<TransactionType>(
    editing?.type ?? preSelectedCategory?.type ?? 'expense'
  );
  const [amount, setAmount] = useState(editing?.amount.toString() ?? '');
  const [categoryId, setCategoryId] = useState(
    editing?.category.id ?? preSelectedCategoryId ?? ''
  );
  const [paymentMethodId, setPaymentMethodId] = useState(editing?.paymentMethod.id ?? paymentMethods[0]?.id ?? '');
  const [date, setDate] = useState(editing?.date ?? new Date());
  const [notes, setNotes] = useState(editing?.notes ?? '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const filtered = categories.filter((c) => c.type === type);
    if (filtered.length > 0 && !filtered.find((c) => c.id === categoryId)) {
      setCategoryId(filtered[0].id);
    }
  }, [type, categories]);

  useEffect(() => {
    if (preSelectedCategoryId && !editing && categories.length > 0) {
      const cat = categories.find((c) => c.id === preSelectedCategoryId);
      if (cat) {
        setType(cat.type);
        setCategoryId(cat.id);
      }
    }
  }, [preSelectedCategoryId, editing, categories]);

  const filteredCategories = categories.filter((c) => c.type === type);
  const categoryGroups = getCategoriesGroupedByMain(filteredCategories, type);
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedPayment = paymentMethods.find((p) => p.id === paymentMethodId);

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0 || !categoryId || !paymentMethodId) return;
    const category = categories.find((c) => c.id === categoryId);
    const payment = paymentMethods.find((p) => p.id === paymentMethodId);
    if (!category || !payment) return;

    const payload = {
      type,
      amount: num,
      category,
      paymentMethod: payment,
      date,
      notes: notes.trim() || undefined,
    };

    if (editing) {
      updateTransaction(editing.id, payload);
    } else {
      addTransaction(payload);
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title={editing ? 'Edit Entry' : 'Add Entry'} />
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={[styles.headerCancel, { color: colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Type toggle */}
        <View style={styles.toggleWrap}>
          <Text style={[styles.toggleLabel, type === 'expense' && styles.toggleLabelActiveRed]}>Expense</Text>
          <TouchableOpacity
            style={[styles.switch, type === 'income' && styles.switchOn]}
            onPress={() => setType(type === 'income' ? 'expense' : 'income')}
          >
            <View style={[styles.switchKnob, type === 'income' && styles.switchKnobOn]} />
          </TouchableOpacity>
          <Text style={[styles.toggleLabel, type === 'income' && styles.toggleLabelActiveGreen]}>Income</Text>
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowCategoryModal(true)}>
            {selectedCategory ? (
              <View style={styles.pickerContent}>
                <View style={[styles.pickerIconWrap, { backgroundColor: `${selectedCategory.color}20` }]}>
                  {React.createElement(getIcon(selectedCategory.icon || 'Circle'), {
                    size: 20,
                    color: selectedCategory.color,
                  })}
                </View>
                <Text style={styles.pickerText}>{selectedCategory.name}</Text>
              </View>
            ) : (
              <Text style={styles.pickerPlaceholder}>Select category</Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Payment method */}
        <View style={styles.field}>
          <Text style={styles.label}>Payment Method</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowPaymentModal(true)}>
            {selectedPayment ? (
              <View style={styles.pickerContent}>
                {React.createElement(getIcon(selectedPayment.icon || 'Wallet'), {
                  size: 20,
                  color: colors.textSecondary,
                })}
                <Text style={styles.pickerText}>{selectedPayment.name}</Text>
              </View>
            ) : (
              <Text style={styles.pickerPlaceholder}>Select payment method</Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity style={styles.picker} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.pickerText}>{format(date, 'MMMM d, yyyy')}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => {
                setShowDatePicker(Platform.OS !== 'ios');
                if (d) setDate(d);
              }}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add a note..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>{editing ? 'Update Entry' : 'Save Entry'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category modal - grouped by main category */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCategoryModal(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
            <ScrollView style={styles.modalScroll}>
              {categoryGroups.map((group) => {
                const selectable = group.children.length > 0 ? group.children : [group.main];
                return (
                  <View key={group.main.id} style={styles.categoryGroup}>
                    <Text style={[styles.categoryGroupTitle, { color: colors.textSecondary }]}>
                      {group.main.name}
                    </Text>
                    {selectable.map((cat) => {
                      const Icon = getIcon(cat.icon || 'Circle');
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.modalOption, { borderBottomColor: colors.border }]}
                          onPress={() => {
                            setCategoryId(cat.id);
                            setShowCategoryModal(false);
                          }}
                        >
                          <View style={[styles.modalOptionIcon, { backgroundColor: `${cat.color}20` }]}>
                            <Icon size={22} color={cat.color} />
                          </View>
                          <Text style={[styles.modalOptionText, { color: colors.text }]}>{cat.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPaymentModal(false)}>
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <ScrollView style={styles.modalScroll}>
              {paymentMethods.map((pm) => {
                const Icon = getIcon(pm.icon || 'Wallet');
                return (
                  <TouchableOpacity
                    key={pm.id}
                    style={styles.modalOption}
                    onPress={() => {
                      setPaymentMethodId(pm.id);
                      setShowPaymentModal(false);
                    }}
                  >
                    <Icon size={22} color={colors.textSecondary} />
                    <Text style={styles.modalOptionText}>{pm.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  headerBtn: { minWidth: 70 },
  headerCancel: { color: colors.primary, fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  toggleLabelActiveRed: { color: colors.expense },
  toggleLabelActiveGreen: { color: colors.income },
  switch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchOn: { backgroundColor: colors.income },
  switchKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchKnobOn: { alignSelf: 'flex-end' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingLeft: 16,
  },
  currency: { fontSize: 28, fontWeight: '700', color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', color: colors.text, paddingVertical: 16 },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
  },
  pickerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pickerIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pickerText: { fontSize: 16, fontWeight: '500', color: colors.text },
  pickerPlaceholder: { fontSize: 16, color: colors.textMuted },
  chevron: { fontSize: 24, color: colors.textMuted, fontWeight: '300' },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: colors.white, fontSize: 18, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  modalScroll: { maxHeight: 320 },
  categoryGroup: { marginBottom: 16 },
  categoryGroupTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modalOptionText: { fontSize: 16, color: colors.text, fontWeight: '500' },
});
