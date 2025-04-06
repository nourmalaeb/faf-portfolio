export const metadata = {
  title: `Firas's content HQ`,
  description: 'Firas Abou Fakher is a multi-hyphenate',
};

export default function SanityRootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
