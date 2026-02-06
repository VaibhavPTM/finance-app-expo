import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { getIcon } from './IconMap';
import { colors } from '../theme';
import { PaymentMethod } from '../types/finance';

const ICON_OPTIONS = ['Building2', 'Landmark', 'CreditCard', 'Wallet', 'Banknote', 'Coins', 'PiggyBank', 'BadgeDollarSign', 'CircleDollarSign'];

const ACCOUNT_TYPES: { value: PaymentMethod['type']; label: string }[] = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'credit-card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (method: Omit<PaymentMethod, 'id'>) => void;
};

export function AddBankModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethod['type']>('bank');
  const [selectedIcon, setSelectedIcon] = useState('Building2');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      type,
      icon: selectedIcon,
    });
    setName('');
    setType('bank');
    setSelectedIcon('Building2');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setType('bank');
    setSelectedIcon('Building2');
    onClose();
  };

  const IconPreview = getIcon(selectedIcon);
  const typeLabel = ACCOUNT_TYPES.find((t) => t.value === type)?.label ?? type;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Add Payment Method</Text>

          <Text style={styles.label}>Account type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
            {ACCOUNT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeChip, type === t.value && styles.typeChipActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.typeChipText, type === t.value && styles.typeChipTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>
            {type === 'cash' ? 'Name' : type === 'credit-card' ? 'Card name' : 'Bank name'}
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={
              type === 'cash'
                ? 'e.g. Cash Wallet'
                : type === 'credit-card'
                ? 'e.g. Visa Platinum'
                : 'e.g. Chase Checking'
            }
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {ICON_OPTIONS.map((iconName) => {
              const Icon = getIcon(iconName);
              const selected = selectedIcon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  style={[styles.iconBtn, selected && styles.iconBtnSelected]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  <Icon size={24} color={selected ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.preview}>
            <IconPreview size={28} color={colors.text} />
            <View>
              <Text style={styles.previewName}>{name || 'Payment method name'}</Text>
              <Text style={styles.previewType}>{typeLabel}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveBtnText}>Add Payment Method</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  typeScroll: { marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 10,
  },
  typeChipActive: { backgroundColor: colors.primary },
  typeChipText: { fontSize: 15, fontWeight: '500', color: colors.text },
  typeChipTextActive: { color: colors.white },
  input: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnSelected: { backgroundColor: `${colors.primary}20`, borderWidth: 2, borderColor: colors.primary },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 24,
  },
  previewName: { fontSize: 16, fontWeight: '600', color: colors.text },
  previewType: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  saveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
