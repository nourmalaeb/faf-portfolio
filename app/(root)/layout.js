import '../../styles/reset.css';
import '../../styles/globals.css';
import styles from './app.module.css';
import { body, mono, header } from '../../components/utils/fonts';
import { ReactLenis } from '../../components/utils/lenis';
import 'lenis/dist/lenis.css';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'Firas Abou Fakher • Composer • Producer • Director',
  description: 'Firas Abou Fakher is a multi-hyphenate',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${mono.variable} ${body.variable} ${header.variable}`}
      style={{ scrollBehavior: 'smooth' }}
      suppressHydrationWarning
    >
      <ReactLenis root>
        <ThemeProvider>
          <body className={styles.root}>{children}</body>
        </ThemeProvider>
      </ReactLenis>
    </html>
  );
}
