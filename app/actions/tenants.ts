'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export async function deleteTenant(id: string) {
  console.log('Attempting to delete tenant:', id);
  try {
    await prisma.tenant.delete({
      where: { id }
    });
    console.log('Successfully deleted tenant:', id);
    revalidatePath('/admin/tenants');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete tenant:', id, error);
    return { error: `Failed to delete tenant: ${error.message || 'Unknown error'}` };
  }
}

export async function updateTenant(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const logoFile = formData.get('logo') as File | null;

  if (!name || !slug) {
    return { error: 'Name and Slug are required' };
  }

  let logoUrl = undefined;
  if (logoFile && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const filename = `logo-${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const dirPath = path.join(process.cwd(), 'public', 'uploads', 'logos');
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.join(dirPath, filename), buffer);
      logoUrl = `/uploads/logos/${filename}`;
    } catch (e) {
      console.error('Logo upload failed', e);
    }
  }

  try {
    await prisma.tenant.update({
      where: { id },
      data: {
        name,
        slug,
        ...(logoUrl && { logoUrl })
      }
    });
  } catch (error: any) {
    console.error('Failed to update tenant', error);
    return { error: 'Failed to update tenant' };
  }

  revalidatePath('/admin/settings');
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin/settings');
}

export async function createTenant(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const logoFile = formData.get('logo') as File | null;

  if (!name || !slug) {
    return { error: 'Name and Slug are required' };
  }

  let logoUrl = null;
  if (logoFile && logoFile.size > 0) {
    try {
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      const filename = `logo-${Date.now()}-${logoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const dirPath = path.join(process.cwd(), 'public', 'uploads', 'logos');
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.join(dirPath, filename), buffer);
      logoUrl = `/uploads/logos/${filename}`;
    } catch (e) {
      console.error('Logo upload failed', e);
    }
  }

  try {
    await prisma.tenant.create({
      data: { name, slug, logoUrl }
    });
    revalidatePath('/admin/tenants');
    revalidatePath('/admin');
  } catch (e) {
    console.error('Failed to create shop', e);
    return { error: 'Failed to create shop' };
  }
}


