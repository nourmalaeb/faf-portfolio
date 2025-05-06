import '../styles/reset.css';
import '../styles/globals.css';
import styles from './app.module.css';
import { body, mono, header } from './fonts';
import { ReactLenis } from '../components/utils/lenis';

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
    >
      <ReactLenis root>
        <body className={styles.root}>{children}</body>
      </ReactLenis>
    </html>
  );
}
