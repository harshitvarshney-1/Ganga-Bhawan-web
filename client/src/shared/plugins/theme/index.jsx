import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '../../states/theme';

export function ThemeProvider({ children }) {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return children;
}
