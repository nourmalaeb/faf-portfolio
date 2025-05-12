import '../../styles/reset.css';
import '../../styles/globals.css';
import styles from './app.module.css';
import { body, mono, header } from '../../components/utils/fonts';
import 'lenis/dist/lenis.css';
import { Providers } from './providers'; // Import the new Providers component

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
      {/* Next.js automatically handles the <head> tag */}
      <body className={styles.root}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
