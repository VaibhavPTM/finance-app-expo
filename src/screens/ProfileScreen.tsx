import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFinance } from '../context/FinanceContext';
import { getIcon } from '../components/IconMap';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { AddBankModal } from '../components/AddBankModal';
import { colors } from '../theme';

export function ProfileScreen() {
  const { categories, paymentMethods, addCategory, addPaymentMethod } = useFinance();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Manage categories and payment methods</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => setShowAddCategory(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subsectionTitle}>Income</Text>
        <View style={styles.card}>
          {incomeCategories.map((cat) => {
            const Icon = getIcon(cat.icon || 'Circle');
            return (
              <View key={cat.id} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                  <Icon size={20} color={cat.color} />
                </View>
                <Text style={styles.rowText}>{cat.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.subsectionTitle}>Expense</Text>
        <View style={styles.card}>
          {expenseCategories.map((cat) => {
            const Icon = getIcon(cat.icon || 'Circle');
            return (
              <View key={cat.id} style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: `${cat.color}20` }]}>
                  <Icon size={20} color={cat.color} />
                </View>
                <Text style={styles.rowText}>{cat.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={() => setShowAddBank(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {paymentMethods.map((pm) => {
            const Icon = getIcon(pm.icon || 'Wallet');
            return (
              <View key={pm.id} style={styles.row}>
                <View style={styles.pmIconWrap}>
                  <Icon size={20} color={colors.text} />
                </View>
                <View style={styles.pmContent}>
                  <Text style={styles.rowText}>{pm.name}</Text>
                  <Text style={styles.pmType}>{pm.type.replace('-', ' ')}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            );
          })}
        </View>
      </View>

      <Text style={styles.footer}>Finance Manager v1.0</Text>
      <View style={{ height: 100 }} />
      <AddCategoryModal
        visible={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onSave={(data) => {
          addCategory(data);
          setShowAddCategory(false);
        }}
      />
      <AddBankModal
        visible={showAddBank}
        onClose={() => setShowAddBank(false)}
        onSave={(data) => {
          addPaymentMethod(data);
          setShowAddBank(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  header: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  addBtn: {},
  addBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  subsectionTitle: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginBottom: 8, paddingLeft: 4 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pmIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '500', color: colors.text },
  pmContent: { flex: 1 },
  pmType: { fontSize: 13, color: colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  chevron: { fontSize: 20, color: colors.textMuted },
  footer: { textAlign: 'center', fontSize: 13, color: colors.textMuted, marginTop: 24 },
});
