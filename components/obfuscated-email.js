'use client';

import { useEffect, useState } from 'react';

export default function ObfuscatedEmailLink({
  emailUser,
  emailDomain,
  subject,
  className,
  children,
}) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const actualEmail = `${emailUser}@${emailDomain}`;

  const mailtoLink = `mailto:${actualEmail}${subject ? `?subject=${subject}` : ''}`;

  if (!hydrated) return <span style={{ display: 'block' }}>{children}</span>;

  return (
    <a href={mailtoLink} style={{ display: 'block' }} className={className}>
      {children}
    </a>
  );
}
