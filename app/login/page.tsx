import React from 'react';
import { prisma } from '@/lib/prisma';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'kookies' }
  });

  return <LoginForm logoUrl={tenant?.logoUrl} />;
}
