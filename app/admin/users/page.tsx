import React from 'react';
import styles from './users.module.css';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

async function createUser(formData: FormData) {
  'use server';
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const role = formData.get('role') as string;

  if (!email || !password) return;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email, password: hashedPassword, name, role } });
  revalidatePath('/admin/users');
}

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage all registered users and admin accounts.</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.listSection}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className={styles.boldCell}>{user.name || '—'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === 'ADMIN' ? styles.badgeAdmin : styles.badgeCustomer}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user._count.orders}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className={styles.emptyState}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2>Create User</h2>
            <form action={createUser} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" name="name" className={styles.input} placeholder="Jane Doe" />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" name="email" className={styles.input} required placeholder="jane@example.com" />
              </div>
              <div className={styles.formGroup}>
                <label>Password</label>
                <input type="password" name="password" className={styles.input} required placeholder="••••••••" />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select name="role" className={styles.input}>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className={styles.btnPrimary}>Create User</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
