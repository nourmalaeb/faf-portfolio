import '../styles/reset.css';
import '../styles/globals.css';
import styles from './app.module.css';
import { body, mono } from './fonts';

export const metadata = {
  title: 'Firas Abou Fakher • Composer • Producer • Director',
  description: 'Firas Abou Fakher is a multi-hyphenate',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${mono.variable} ${body.variable}`}>
      <body className={styles.root}>
        <main>{children}</main>
      </body>
    </html>
  );
}
