
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme-preference') as Theme | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);
  
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme-preference', next);
    document.documentElement.setAttribute('data-theme', next);
  };
  
  return { theme, toggleTheme, mounted };
}
