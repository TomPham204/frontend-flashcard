'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import getThemeConfig from './theme';

function MUIThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const theme = React.useMemo(
    () => createTheme(getThemeConfig(resolvedTheme === 'dark' ? 'dark' : 'light')),
    [resolvedTheme]
  );

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <NextThemesProvider attribute="data-theme" defaultTheme="system" enableSystem>
        <MUIThemeWrapper>{children}</MUIThemeWrapper>
      </NextThemesProvider>
    </AppRouterCacheProvider>
  );
}
