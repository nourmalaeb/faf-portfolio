import { Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';

export const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  // weight: '400',
  display: 'swap',
});

export const body_self = localFont({
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

export const body = localFont({
  src: [
    {
      path: '../styles/fonts/PPFragment-GlareLight.woff2',
      style: 'normal',
      weight: '300',
    },
    {
      path: '../styles/fonts/PPFragment-TextRegular.woff2',
      style: 'normal',
      weight: '400',
    },
    {
      path: '../styles/fonts/PPFragment-TextBold.woff2',
      style: 'normal',
      weight: '700',
    },
    {
      path: '../styles/fonts/PPFragment-GlareLightItalic.woff2',
      style: 'italic',
      weight: '300',
    },
    {
      path: '../styles/fonts/PPFragment-TextRegularItalic.woff2',
      style: 'italic',
      weight: '400',
    },
    {
      path: '../styles/fonts/PPFragment-TextBoldItalic.woff2',
      style: 'italic',
      weight: '700',
    },
  ],
  display: 'swap',
  variable: '--font-body',
});
