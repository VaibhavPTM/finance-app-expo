import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import { getIcon } from '../components/IconMap';
import { AppHeader } from '../components/AppHeader';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { AddBankModal } from '../components/AddBankModal';
import { getMainCategories, getSubcategories } from '../utils/finance';
import { Category } from '../types/finance';

export function ProfileScreen() {
  const { colors, theme, setTheme } = useTheme();
  const {
    categories,
    paymentMethods,
    quickAddCategoryIds,
    setQuickAddCategoryIds,
    addCategory,
    deleteCategory,
    addPaymentMethod,
  } = useFinance();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);

  const incomeMains = getMainCategories(categories, 'income');
  const expenseMains = getMainCategories(categories, 'expense');

  const toggleQuickAdd = (categoryId: string) => {
    if (quickAddCategoryIds.includes(categoryId)) {
      setQuickAddCategoryIds(quickAddCategoryIds.filter((id) => id !== categoryId));
    } else {
      setQuickAddCategoryIds([...quickAddCategoryIds, categoryId]);
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    const isMain = !cat.parentId;
    Alert.alert(
      'Delete category',
      isMain
        ? `Delete "${cat.name}" and all its subcategories?`
        : `Delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(cat.id) },
      ]
    );
  };

  const renderLeftDelete = (cat: Category) => (
    <TouchableOpacity
      style={[styles.deleteAction, { backgroundColor: colors.expense }]}
      onPress={() => handleDeleteCategory(cat)}
      activeOpacity={0.8}
    >
      <Text style={styles.deleteActionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderCategoryRow = (cat: Category, isSub = false, includeKey = true) => {
    const Icon = getIcon(cat.icon || 'Circle');
    const isQuick = quickAddCategoryIds.includes(cat.id);
    const row = (
      <TouchableOpacity
        {...(includeKey ? { key: cat.id } : {})}
        style={[styles.row, isSub && styles.subRow, { borderBottomColor: colors.border }]}
        onPress={() => toggleQuickAdd(cat.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }, isSub && styles.subIconWrap]}>
          <Icon size={isSub ? 18 : 20} color={cat.color} />
        </View>
        <Text style={[styles.rowText, { color: colors.text }, isSub && styles.subRowText]}>{cat.name}</Text>
        <View style={[styles.quickAddBadge, { backgroundColor: colors.background }, isQuick && { backgroundColor: colors.primary }]}>
          <Text style={[styles.quickAddBadgeText, { color: colors.textSecondary }, isQuick && { color: colors.white }]}>
            {isQuick ? 'On' : 'Add'}
          </Text>
        </View>
      </TouchableOpacity>
    );
    return row;
  };

  const renderMainWithSubs = (main: Category, type: 'income' | 'expense') => {
    const subs = getSubcategories(categories, main.id);
    const Icon = getIcon(main.icon || 'Circle');
    return (
      <View key={main.id} style={styles.mainGroup}>
        <Swipeable renderLeftActions={() => renderLeftDelete(main)}>
          <View style={[styles.mainRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${main.color}20` }]}>
              <Icon size={20} color={main.color} />
            </View>
            <Text style={[styles.mainRowText, { color: colors.text }]}>{main.name}</Text>
            <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
          </View>
        </Swipeable>
        {subs.map((sub) => (
          <Swipeable key={sub.id} renderLeftActions={() => renderLeftDelete(sub)}>
            {renderCategoryRow(sub, true, false)}
          </Swipeable>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Settings" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.themeSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: theme === 'light' ? colors.primary : colors.background },
              ]}
              onPress={() => setTheme('light')}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: theme === 'light' ? colors.white : colors.text },
                ]}
              >
                ☀️ Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: theme === 'dark' ? colors.primary : colors.background },
              ]}
              onPress={() => setTheme('dark')}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: theme === 'dark' ? colors.white : colors.text },
                ]}
              >
                🌙 Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Add on Home</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Tap a category to show or hide it on the home screen
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {categories.map((cat) => renderCategoryRow(cat))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
            <TouchableOpacity onPress={() => setShowAddCategory(true)}>
              <Text style={[styles.addBtnText, { color: colors.primary }]}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.textSecondary }]}>Income</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {incomeMains.map((main) => renderMainWithSubs(main, 'income'))}
          </View>

          <Text style={[styles.subsectionTitle, { color: colors.textSecondary }]}>Expense</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {expenseMains.map((main) => renderMainWithSubs(main, 'expense'))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Methods</Text>
            <TouchableOpacity onPress={() => setShowAddBank(true)}>
              <Text style={[styles.addBtnText, { color: colors.primary }]}>+ Add New</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {paymentMethods.map((pm) => {
              const Icon = getIcon(pm.icon || 'Wallet');
              return (
                <View key={pm.id} style={[styles.row, { borderBottomColor: colors.border }]}>
                  <View style={[styles.pmIconWrap, { backgroundColor: colors.background }]}>
                    <Icon size={20} color={colors.text} />
                  </View>
                  <View style={styles.pmContent}>
                    <Text style={[styles.rowText, { color: colors.text }]}>{pm.name}</Text>
                    <Text style={[styles.pmType, { color: colors.textSecondary }]}>{pm.type.replace('-', ' ')}</Text>
                  </View>
                  <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textMuted }]}>Finance Manager v1.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>

      <AddCategoryModal
        visible={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={(data) => {
          addCategory(data);
          setShowAddCategory(false);
        }}
        categories={categories}
      />
      <AddBankModal
        visible={showAddBank}
        onClose={() => setShowAddBank(false)}
        onSave={(data) => {
          addPaymentMethod(data);
          setShowAddBank(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
  themeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  themeRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  themeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  themeBtnText: { fontSize: 15, fontWeight: '600' },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, marginBottom: 12 },
  subsectionTitle: { fontSize: 14, fontWeight: '500', marginBottom: 8, paddingLeft: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainGroup: {},
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  mainRowText: { flex: 1, fontSize: 16, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  subRow: { paddingLeft: 52 },
  subIconWrap: { width: 36, height: 36, borderRadius: 18 },
  subRowText: { fontSize: 15 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '500' },
  quickAddBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  quickAddBadgeText: { fontSize: 13, fontWeight: '600' },
  pmIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pmContent: { flex: 1 },
  pmType: { fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  chevron: { fontSize: 20 },
  addBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 13, marginTop: 24 },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 0,
  },
  deleteActionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
