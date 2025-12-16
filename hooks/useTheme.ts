
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useEffect, useState } from 'react';

type Theme = 'DARK' | 'LIGHT';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('DARK');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme-preference');
    const initial: Theme = (stored === 'light' || stored === 'LIGHT') ? 'LIGHT' : 'DARK';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial.toLowerCase());
  }, []);
  
  const toggleTheme = () => {
    const next: Theme = theme === 'DARK' ? 'LIGHT' : 'DARK';
    setTheme(next);
    localStorage.setItem('theme-preference', next);
    document.documentElement.setAttribute('data-theme', next.toLowerCase());
  };
  
  return { theme, toggleTheme, mounted };
}
