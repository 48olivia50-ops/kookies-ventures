'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) return;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'kookies' } });
  if (!tenant) return;

  try {
    await prisma.category.create({
      data: {
        name,
        slug,
        tenantId: tenant.id
      }
    });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to create category', error);
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get('name') as string;

  if (!name) return;

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }
    });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to update category', error);
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to delete category', error);
  }
}
