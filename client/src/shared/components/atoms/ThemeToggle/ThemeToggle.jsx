import { useAtom } from 'jotai';
import { Sun, Moon } from 'lucide-react';
import { themeAtom } from '../../../states/theme';

export function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
      className={`p-2.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${className}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
