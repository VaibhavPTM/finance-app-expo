import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getIcon } from './IconMap';
import { colors } from '../theme';

type Props = {
  iconName: string;
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ iconName, title, description, action }: Props) {
  const Icon = getIcon(iconName);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={40} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {action && (
        <TouchableOpacity style={styles.button} onPress={action.onPress} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 280,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
