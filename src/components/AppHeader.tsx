import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const APP_NAME = 'Finance Manager';

type Props = {
  title?: string;
  /** If true, header uses primary color background; else card color */
  primary?: boolean;
  /** Show back button and call this when pressed */
  onBack?: () => void;
};

export function AppHeader({ title = APP_NAME, primary = false, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const bg = primary ? colors.headerBg : colors.card;
  const textColor = primary ? colors.headerText : colors.text;
  const borderColor = primary ? 'transparent' : colors.border;

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12),
          paddingBottom: 12,
          backgroundColor: bg,
          borderBottomWidth: primary ? 0 : 1,
          borderBottomColor: borderColor,
        },
      ]}
    >
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.backText, { color: textColor }]}>‹ Back</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={[styles.title, { color: textColor }, onBack && styles.titleWithBack]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 12 },
  backText: { fontSize: 17, fontWeight: '600' },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flexShrink: 1,
  },
  titleWithBack: { flex: 1 },
});
