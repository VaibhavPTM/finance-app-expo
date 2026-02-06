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
import { Category, TransactionType } from '../types/finance';

const ICON_OPTIONS = [
  'ShoppingBag', 'UtensilsCrossed', 'Car', 'Home', 'Zap', 'Heart', 'Film', 'Music',
  'Plane', 'Train', 'Coffee', 'Pizza', 'Shirt', 'Smartphone', 'Laptop', 'Gamepad2',
  'Book', 'GraduationCap', 'Dumbbell', 'Bike', 'Trees', 'PawPrint', 'Baby', 'Palette',
  'Briefcase', 'DollarSign', 'TrendingUp', 'Gift', 'Handshake', 'Wallet', 'Circle',
];

const COLOR_OPTIONS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#64748b',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
};

export function AddCategoryModal({ visible, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedIcon, setSelectedIcon] = useState('Circle');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type,
    });
    setName('');
    setSelectedIcon('Circle');
    setSelectedColor('#3b82f6');
    setType('expense');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setSelectedIcon('Circle');
    setSelectedColor('#3b82f6');
    setType('expense');
    onClose();
  };

  const IconPreview = getIcon(selectedIcon);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Add Category</Text>

          <View style={styles.toggleWrap}>
            <Text style={[styles.toggleLabel, type === 'expense' && styles.toggleLabelRed]}>Expense</Text>
            <TouchableOpacity
              style={[styles.switch, type === 'income' && styles.switchOn]}
              onPress={() => setType(type === 'income' ? 'expense' : 'income')}
            >
              <View style={[styles.switchKnob, type === 'income' && styles.switchKnobOn]} />
            </TouchableOpacity>
            <Text style={[styles.toggleLabel, type === 'income' && styles.toggleLabelGreen]}>Income</Text>
          </View>

          <Text style={styles.label}>Category name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Groceries"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Icon</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
            {ICON_OPTIONS.map((iconName) => {
              const Icon = getIcon(iconName);
              const selected = selectedIcon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  style={[styles.iconBtn, selected && { backgroundColor: `${selectedColor}25`, borderColor: selectedColor }]}
                  onPress={() => setSelectedIcon(iconName)}
                >
                  <Icon size={24} color={selected ? selectedColor : colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[styles.colorBtn, { backgroundColor: color }, selectedColor === color && styles.colorBtnSelected]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>

          <View style={styles.preview}>
            <View style={[styles.previewIconWrap, { backgroundColor: `${selectedColor}20` }]}>
              <IconPreview size={28} color={selectedColor} />
            </View>
            <View>
              <Text style={styles.previewName}>{name || 'Category name'}</Text>
              <Text style={styles.previewType}>{type}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit}>
              <Text style={styles.saveBtnText}>Add Category</Text>
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
  toggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 20,
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  toggleLabelRed: { color: colors.expense },
  toggleLabelGreen: { color: colors.income },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  switchOn: { backgroundColor: colors.income },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  switchKnobOn: { alignSelf: 'flex-end' },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
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
  iconScroll: { marginBottom: 20, maxHeight: 56 },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorBtnSelected: { borderWidth: 3, borderColor: colors.text },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 24,
  },
  previewIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { fontSize: 16, fontWeight: '600', color: colors.text },
  previewType: { fontSize: 13, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
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
