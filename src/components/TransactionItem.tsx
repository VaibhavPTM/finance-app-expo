import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { formatCurrency } from '../utils/finance';
import { getIcon } from './IconMap';
import { Transaction } from '../types/finance';
import { colors } from '../theme';

type Props = {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
};

const SWIPE_THRESHOLD = 80;

export function TransactionItem({ transaction, onEdit, onDelete }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const CategoryIcon = getIcon(transaction.category.icon || 'Circle');
  const PaymentIcon = getIcon(transaction.paymentMethod.icon || 'Wallet');

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const x = Math.max(-150, Math.min(150, e.translationX));
      translateX.setValue(x);
    })
    .onEnd((e) => {
      const x = e.translationX;
      if (x > SWIPE_THRESHOLD) {
        onEdit(transaction);
      } else if (x < -SWIPE_THRESHOLD) {
        onDelete(transaction.id);
      }
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
    });

  return (
    <View style={styles.wrapper}>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(transaction)}
        >
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => onDelete(transaction.id)}
        >
          <Text style={styles.actionTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ translateX }],
            },
          ]}
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
          <Text
            style={[
              styles.amount,
              transaction.type === 'income' ? styles.amountIncome : styles.amountExpense,
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editBtn: {
    backgroundColor: colors.incomeLight,
  },
  deleteBtn: {
    backgroundColor: colors.expenseLight,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  actionTextDelete: {
    color: colors.expense,
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 120,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  amountIncome: {
    color: colors.income,
  },
  amountExpense: {
    color: colors.expense,
  },
});
