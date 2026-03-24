import React from 'react';
import styles from './settings.module.css';
import { prisma } from '@/lib/prisma';
import { updateTenant } from '@/app/actions/tenants';
import Image from 'next/image';

export default async function SettingsPage() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'kookies' }
  });

  if (!tenant) {
    return <div>Store configuration not found. Please run seed script.</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Store Settings</h1>
        <p className={styles.subtitle}>Manage your brand identity and store configuration.</p>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Brand Identity</h2>
            <p>Customize how your store appears to customers.</p>
          </div>
          
          <form action={updateTenant.bind(null, tenant.id)} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Store Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                defaultValue={tenant.name} 
                className={styles.input} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="slug">Store URL Slug</label>
              <input 
                type="text" 
                id="slug" 
                name="slug" 
                defaultValue={tenant.slug} 
                className={styles.input} 
                required 
              />
              <p className={styles.helpText}>This is used in your store URL (e.g. /kookies)</p>
            </div>

            <div className={styles.formGroup}>
              <label>Current Logo</label>
              <div className={styles.logoPreview}>
                <Image 
                  src={tenant.logoUrl || "/logo.svg"} 
                  alt="Current Logo" 
                  width={200} 
                  height={80} 
                  style={{ objectFit: 'contain' }} 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="logo">Upload New Logo (Image or SVG)</label>
              <input 
                type="file" 
                id="logo" 
                name="logo" 
                accept="image/*,.svg" 
                className={styles.fileInput} 
              />
              <p className={styles.helpText}>Recommended size: 400x120px. Supports PNG, JPG, and SVG.</p>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary}>Save Changes</button>
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Danger Zone</h2>
            <p>Irreversible actions for your store.</p>
          </div>
          <div className={styles.dangerZone}>
            <p>Deleting your store will remove all products, orders, and associated data.</p>
            <button className={styles.btnDanger} disabled>Delete Store</button>
          </div>
        </div>
      </div>
    </div>
  );
}
