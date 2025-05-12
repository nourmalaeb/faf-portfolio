'use client';

import { ThemeProvider } from 'next-themes';
import { ReactLenis } from '../../components/utils/lenis';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <ReactLenis root options={{ autoRaf: true, anchors: true }}>
        {children}
      </ReactLenis>
    </ThemeProvider>
  );
}
