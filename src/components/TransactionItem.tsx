import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { formatCurrency } from '../utils/finance';
import { getIcon } from './IconMap';
import { Transaction } from '../types/finance';
import { colors } from '../theme';

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
};

function TransactionItemComponent({ transaction, onEdit, onDelete }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const CategoryIcon = getIcon(transaction.category.icon || 'Circle');
  const PaymentIcon = getIcon(transaction.paymentMethod.icon || 'Wallet');
  const MoreIcon = getIcon('MoreHorizontal');

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    onEdit(transaction);
  }, [onEdit, transaction]);

  const handleDelete = useCallback(() => {
    setShowMenu(false);
    onDelete(transaction.id);
  }, [onDelete, transaction.id]);

  return (
    <>
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onLongPress={() => setShowMenu(true)}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${transaction.category.color}20` },
            ]}
          >
            <CategoryIcon size={24} color={transaction.category.color} />
          </View>
          <View style={styles.content}>
            <View style={styles.row}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {transaction.category.name}
              </Text>
              <View style={styles.badge}>
                <PaymentIcon size={12} color={colors.textSecondary} />
                <Text style={styles.badgeText} numberOfLines={1}>
                  {transaction.paymentMethod.name}
                </Text>
              </View>
            </View>
            {transaction.notes ? (
              <Text style={styles.notes} numberOfLines={1}>
                {transaction.notes}
              </Text>
            ) : null}
          </View>
          <View style={styles.right}>
            <Text
              style={[
                styles.amount,
                transaction.type === 'income' ? styles.amountIncome : styles.amountExpense,
              ]}
              numberOfLines={1}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </Text>
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              onPress={() => setShowMenu(true)}
              style={styles.moreBtn}
            >
              <MoreIcon size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>

      <Modal visible={showMenu} transparent animationType="fade">
        <Pressable style={styles.menuOverlay} onPress={() => setShowMenu(false)}>
          <View style={styles.menuSheet}>
            <TouchableOpacity style={styles.menuOption} onPress={handleEdit} activeOpacity={0.7}>
              <Text style={styles.menuOptionTextEdit}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuOption} onPress={handleDelete} activeOpacity={0.7}>
              <Text style={styles.menuOptionTextDelete}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuOption, styles.menuOptionCancel]}
              onPress={() => setShowMenu(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuOptionTextCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export const TransactionItem = React.memo(TransactionItemComponent);

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryName: {
    flex: 1,
    minWidth: 0,
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 90,
  },
  badgeText: { fontSize: 11, color: colors.textSecondary },
  notes: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  amount: { fontSize: 17, fontWeight: '700' },
  amountIncome: { color: colors.income },
  amountExpense: { color: colors.expense },
  moreBtn: { padding: 4 },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  menuSheet: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuOption: { padding: 18 },
  menuOptionCancel: { borderTopWidth: 1, borderTopColor: colors.border },
  menuOptionTextEdit: { fontSize: 16, fontWeight: '600', color: colors.primary },
  menuOptionTextDelete: { fontSize: 16, fontWeight: '600', color: colors.expense },
  menuOptionTextCancel: { fontSize: 16, color: colors.textSecondary },
});
