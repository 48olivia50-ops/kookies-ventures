'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export async function deleteProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (product?.imageUrl) {
      const filePath = path.join(process.cwd(), 'public', product.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Delete all product images
    const productImages = await prisma.productImage.findMany({ where: { productId: id } });
    for (const img of productImages) {
      const filePath = path.join(process.cwd(), 'public', img.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.product.delete({ where: { id } });
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete product:', error);
    return { error: error.message || 'Failed to delete product' };
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (image) {
      const filePath = path.join(process.cwd(), 'public', image.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await prisma.productImage.delete({ where: { id: imageId } });
    }
    revalidatePath('/admin/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete image:', error);
    return { error: error.message || 'Failed to delete image' };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<void> {
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const stock = parseInt(formData.get('stock') as string) || 0;
  const description = formData.get('description') as string;
  const imageFiles = formData.getAll('images') as File[];
  const mainImageFile = formData.get('image') as File | null;

  if (!name || isNaN(price)) {
    throw new Error('Name and Price are required');
  }

  let imageUrl = undefined;

  // Handle main image upload
  if (mainImageFile && mainImageFile.size > 0) {
    try {
      const buffer = Buffer.from(await mainImageFile.arrayBuffer());
      const filename = `${Date.now()}-${mainImageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const dirPath = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(path.join(dirPath, filename), buffer);
      imageUrl = `/uploads/${filename}`;
    } catch (e) {
      console.error('Main image upload failed', e);
    }
  }

  // Handle multiple images upload
  const newImageUrls: string[] = [];
  for (const imageFile of imageFiles) {
    if (imageFile && imageFile.size > 0) {
      try {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const dirPath = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
        fs.writeFileSync(path.join(dirPath, filename), buffer);
        newImageUrls.push(`/uploads/${filename}`);
      } catch (e) {
        console.error('Image upload failed', e);
      }
    }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        stock,
        description,
        ...(imageUrl && { imageUrl }),
        ...(newImageUrls.length > 0 && {
          images: {
            create: newImageUrls.map(url => ({ url }))
          }
        })
      }
    });
  } catch (error: any) {
    console.error('Failed to update product', error);
    throw new Error(error.message || 'Failed to update product');
  }

  revalidatePath('/admin/products');
  revalidatePath('/');
  redirect('/admin/products');
}
