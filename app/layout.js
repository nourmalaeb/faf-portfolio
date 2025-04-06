import '../styles/globals.css';
import styles from './app.module.css';

export const metadata = {
  title: 'Firas Abou Fakher • Composer • Producer',
  description: 'Firas Abou Fakher is a multi-hyphenate',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={styles.root}>
        <main>{children}</main>
      </body>
    </html>
  );
}
