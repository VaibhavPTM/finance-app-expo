import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const APP_NAME = 'Finance Manager';

type Props = {
  title?: string;
  /** If true, header uses primary color background; else card color */
  primary?: boolean;
};

export function AppHeader({ title = APP_NAME, primary = false }: Props) {
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
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
});
