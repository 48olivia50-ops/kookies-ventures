'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import styles from './categories.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    description: string | null;
    _count: { products: number };
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    return (
        <div className={styles.content}>
            <div className={styles.listSection}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Category Name</th>
                                <th>Slug</th>
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    <td>
                                        {category.imageUrl ? (
                                            <div className={styles.categoryImageCell}>
                                                <Image
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    width={60}
                                                    height={60}
                                                    className={styles.categoryImage}
                                                />
                                            </div>
                                        ) : (
                                            <div className={styles.categoryImagePlaceholder}>🖼️</div>
                                        )}
                                    </td>
                                    <td className={styles.boldCell}>
                                        {editingId === category.id ? (
                                            <form action={async (formData: FormData) => {
                                                await updateCategory(category.id, formData);
                                                setEditingId(null);
                                            }}>
                                                <div className={styles.editForm}>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        defaultValue={category.name}
                                                        className={styles.inlineInput}
                                                    />
                                                    <input
                                                        type="text"
                                                        name="imageUrl"
                                                        defaultValue={category.imageUrl || ''}
                                                        placeholder="Image URL"
                                                        className={styles.inlineInput}
                                                    />
                                                    <input
                                                        type="text"
                                                        name="description"
                                                        defaultValue={category.description || ''}
                                                        placeholder="Description"
                                                        className={styles.inlineInput}
                                                    />
                                                    <div className={styles.editActions}>
                                                        <button type="submit" className={styles.saveBtn}>Save</button>
                                                        <button type="button" onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                                                    </div>
                                                </div>
                                            </form>
                                        ) : (
                                            <div>
                                                <div>{category.name}</div>
                                                {category.description && (
                                                    <div className={styles.categoryDesc}>{category.description}</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8125rem' }}>
                                        {category.slug}
                                    </td>
                                    <td>{category._count.products} products</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            {editingId !== category.id && (
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingId(category.id)}
                                                    className={styles.editBtn}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <form action={async () => {
                                                await deleteCategory(category.id);
                                            }}>
                                                <button type="submit" className={styles.deleteBtn}>
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>No categories added yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.formSection}>
                <div className={styles.formCard}>
                    <h2>Add New Category</h2>
                    <form action={async (formData: FormData) => {
                        await createCategory(formData);
                        setShowCreateForm(false);
                    }}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Category Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                placeholder="e.g. Duvets, Curtains"
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="imageUrl">Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                placeholder="https://images.unsplash.com/..."
                                className={styles.input}
                            />
                            <p className={styles.hint}>Paste an image URL from Unsplash or any image hosting service.</p>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                placeholder="Brief description of the category"
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" className={styles.btnPrimary}>Create Category</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
