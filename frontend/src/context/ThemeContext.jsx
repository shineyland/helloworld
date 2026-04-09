import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Available theme colors
export const themeColors = {
  blue: {
    name: 'Blue',
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    accent: '#3b82f6',
  },
  purple: {
    name: 'Purple',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#ede9fe',
    accent: '#8b5cf6',
  },
  green: {
    name: 'Green',
    primary: '#059669',
    primaryHover: '#047857',
    primaryLight: '#d1fae5',
    accent: '#10b981',
  },
  red: {
    name: 'Red',
    primary: '#dc2626',
    primaryHover: '#b91c1c',
    primaryLight: '#fee2e2',
    accent: '#ef4444',
  },
  orange: {
    name: 'Orange',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#ffedd5',
    accent: '#f97316',
  },
  pink: {
    name: 'Pink',
    primary: '#db2777',
    primaryHover: '#be185d',
    primaryLight: '#fce7f3',
    accent: '#ec4899',
  },
  teal: {
    name: 'Teal',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#ccfbf1',
    accent: '#14b8a6',
  },
  indigo: {
    name: 'Indigo',
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryLight: '#e0e7ff',
    accent: '#6366f1',
  },
};

// Avatar background colors
export const avatarColors = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    return saved || 'blue';
  });

  const [avatarColor, setAvatarColor] = useState(() => {
    const saved = localStorage.getItem('avatar-color');
    return saved || 'blue';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('avatar-color', avatarColor);
  }, [avatarColor]);

  const applyTheme = (themeName) => {
    const colors = themeColors[themeName];
    if (!colors) return;

    const root = document.documentElement;
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-primary-hover', colors.primaryHover);
    root.style.setProperty('--color-primary-light', colors.primaryLight);
    root.style.setProperty('--color-accent', colors.accent);
  };

  const value = {
    theme,
    setTheme,
    themeColors: themeColors[theme],
    avatarColor,
    setAvatarColor,
    avatarColors: avatarColors[avatarColor],
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
