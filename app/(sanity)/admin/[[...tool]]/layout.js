import styles from './sanity.module.css';

export const metadata = {
  title: `Firas's content HQ`,
  description: 'Firas Abou Fakher is a multi-hyphenate',
};

export default function SanityRootLayout({ children }) {
  return (
    <html lang="en" className={styles.sanityRoot}>
      <body>{children}</body>
    </html>
  );
}
