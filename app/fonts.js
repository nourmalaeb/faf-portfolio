import { Geist_Mono } from '@next/font/google';
import localFont from 'next/font/local';

export const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  // weight: '400',
  display: 'swap',
});

export const body = localFont({
  src: [
    {
      path: '../styles/fonts/self-modern_regular_trial.otf',
      style: 'normal',
      weight: '300',
    },
    {
      path: '../styles/fonts/self-modern_book_trial.otf',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../styles/fonts/self-modern_bold_trial.otf',
      style: 'normal',
      weight: '700',
    },
    {
      path: '../styles/fonts/self-modern_italic_trial.otf',
      style: 'italic',
      weight: '400',
    },
  ],
  display: 'swap',
  variable: '--font-body',
});
