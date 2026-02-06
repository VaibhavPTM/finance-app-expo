export type ThemeMode = 'light' | 'dark';

export const lightColors = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  income: '#059669',
  incomeLight: '#d1fae5',
  expense: '#dc2626',
  expenseLight: '#fee2e2',
  background: '#f9fafb',
  card: '#ffffff',
  border: '#e5e7eb',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  white: '#ffffff',
  headerBg: '#2563eb',
  headerText: '#ffffff',
};

export const darkColors = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  income: '#10b981',
  incomeLight: '#064e3b',
  expense: '#ef4444',
  expenseLight: '#450a0a',
  background: '#111827',
  card: '#1f2937',
  border: '#374151',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  white: '#ffffff',
  headerBg: '#1f2937',
  headerText: '#f9fafb',
};

export const colors = lightColors;

export function getColors(mode: ThemeMode) {
  return mode === 'dark' ? darkColors : lightColors;
}
