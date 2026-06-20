import { useAtom } from 'jotai';
import { Sun, Moon } from 'lucide-react';
import { themeAtom } from '../../../states/theme';

export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={`p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
