'use client';

import { Button } from '@acme/ui/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-app-theme/use-theme';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button size='icon' variant='outline' onClick={toggleTheme}>
      {theme === 'light' ? <Sun className='h-6 w-6' /> : <Moon className='h-6 w-6' />}
    </Button>
  );
}
