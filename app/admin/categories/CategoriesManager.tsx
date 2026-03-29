'use client';
import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import styles from './categories.module.css';

interface Category {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
}

export function CategoriesManager({ categories }: { categories: Category[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');

    const handleEdit = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleSave = async (formData: FormData) => {
        const id = formData.get('id') as string;
        await updateCategory(id, formData);
        setEditingId(null);
        setEditingName('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingName('');
    };

    return (
        <div className={styles.content}>
            <div className={styles.listSection}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Category Name</th>
                                <th>Slug</th>
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id}>
                                    {editingId === category.id ? (
                                        <>
                                            <td colSpan={4}>
                                                <form action={handleSave} className={styles.editForm}>
                                                    <input type="hidden" name="id" value={category.id} />
                                                    <div className={styles.editFormInner}>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            defaultValue={category.name}
                                                            className={styles.inlineInput}
                                                            required
                                                        />
                                                        <div className={styles.editActions}>
                                                            <button type="submit" className={styles.saveBtn}>Save</button>
                                                            <button type="button" onClick={handleCancel} className={styles.cancelBtn}>Cancel</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className={styles.boldCell}>{category.name}</td>
                                            <td style={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.8125rem' }}>
                                                {category.slug}
                                            </td>
                                            <td>{category._count.products} products</td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(category)}
                                                        className={styles.editBtn}
                                                    >
                                                        Edit
                                                    </button>
                                                    <form action={async () => {
                                                        await deleteCategory(category.id);
                                                    }}>
                                                        <button type="submit" className={styles.deleteBtn}>
                                                            Delete
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>No categories added yet.</td>
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
                            <p className={styles.hint}>A unique slug will be generated automatically.</p>
                        </div>
                        <button type="submit" className={styles.btnPrimary}>Create Category</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
