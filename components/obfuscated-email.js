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

  if (!hydrated)
    return <span style={{ display: 'inline-block' }}>{children}</span>;

  return (
    <a
      href={mailtoLink}
      style={{ display: 'inline-block' }}
      className={className}
    >
      {children}
    </a>
  );
}
