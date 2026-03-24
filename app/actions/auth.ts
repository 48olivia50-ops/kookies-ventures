'use server'

import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function registerUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = 'CUSTOMER';

  if (!email || !password) return { error: 'Email and password required' };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'Email already exists' };

  let user;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role }
    });
  } catch {
    return { error: 'Registration failed. Please try again.' };
  }

  await createSession(user.id, user.role, user.tenantId);


  redirect('/');
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password required' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Invalid email or password' };

  let valid = false;
  try {
    valid = await bcrypt.compare(password, user.password);
  } catch {
    return { error: 'Login error. Please try again.' };
  }

  if (!valid) return { error: 'Invalid email or password' };

  await createSession(user.id, user.role, user.tenantId);

  if (user.role === 'ADMIN') {
    redirect('/admin');
  }
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}
