"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Edit2,
  Layers,
  Loader2,
  Check,
  AlertCircle,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import type { Category } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();

  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Synchronize with server data when refreshed
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const handleEditNameChange = (val: string) => {
    setEditName(val);
    setEditSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || "");
    setEditSortOrder(String(cat.sort_order ?? 0));
    setEditIsActive(cat.is_active ?? true);
    setEditErrorMsg("");
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    setEditErrorMsg("");
  };

  // ── Drag and Drop Reordering Handler ──
  const persistOrder = async (updatedList: Category[]) => {
    setIsSavingOrder(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedList.map((c) => ({
            id: c.id,
            sort_order: c.sort_order,
          })),
        }),
      });

      if (res.ok) {
        showToast({
          type: "success",
          title: "Order Updated",
          message: "Category order saved successfully.",
        });
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast({
          type: "error",
          title: "Reorder Failed",
          message: err.error || "Could not save category order.",
        });
        setCategories(initialCategories);
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to server.",
      });
      setCategories(initialCategories);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= categories.length) return;

    const copy = [...categories];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);

    // Resequence sort_order starting at 1
    const resequenced = copy.map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
    }));

    setCategories(resequenced);
    persistOrder(resequenced);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    handleDragReorder(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index >= categories.length - 1) return;
    handleDragReorder(index, index + 1);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          sort_order: Number(sortOrder) || categories.length + 1,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create category");
        showToast({
          type: "error",
          title: "Create Failed",
          message: data.error || "Failed to create category.",
        });
      } else {
        showToast({
          type: "success",
          title: "Category Created 📁",
          message: `Category "${name}" created successfully.`,
        });
        setName("");
        setSlug("");
        setDescription("");
        setSortOrder("0");
        setShowAddForm(false);
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim() || !editSlug.trim()) return;

    setEditLoading(true);
    setEditErrorMsg("");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCategory.id,
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim() || null,
          sort_order: Number(editSortOrder) || 0,
          is_active: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || "Failed to update category");
      } else {
        showToast({
          type: "success",
          title: "Category Updated ✏️",
          message: `Category "${editName}" updated successfully.`,
        });
        closeEditModal();
        router.refresh();
      }
    } catch {
      setEditErrorMsg("Network error occurred while saving.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id: string, catName: string) => {
    confirm({
      title: `Delete Category "${catName}"?`,
      message: "Are you sure you want to delete this category? Any resources assigned to it will become uncategorized.",
      confirmText: "Delete Category",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(id);
        try {
          const res = await fetch("/api/admin/categories", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Category Deleted",
              message: `Category "${catName}" has been removed.`,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Deletion Failed",
              message: data.error || "Failed to delete category.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Error deleting category.",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Reordering helper note */}
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <ArrowUpDown className="w-4 h-4 text-[var(--primary)]" />
          <span>
            Drag rows using the <strong className="text-[var(--foreground)]">⠿</strong> handle or use{" "}
            <strong className="text-[var(--foreground)]">↑ ↓</strong> arrows to change order.
          </span>
          {isSavingOrder && (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] font-semibold animate-pulse ml-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving order...</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Add Category"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Create New Category
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Developer Tools"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="developer-tools"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of resources included..."
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[var(--primary)]"
                />
                <span>Active (Publicly Visible)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
        </form>
      )}

      {categories.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="w-16 px-3 py-3.5 text-center">Order</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5">Sort #</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {categories.map((cat, idx) => {
                const isDragging = draggedIndex === idx;
                const isOver = dragOverIndex === idx && draggedIndex !== idx;

                return (
                  <tr
                    key={cat.id}
                    draggable={true}
                    onDragStart={(e) => {
                      setDraggedIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverIndex !== idx) {
                        setDragOverIndex(idx);
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOverIndex(idx);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== idx) {
                        handleDragReorder(draggedIndex, idx);
                      }
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`transition-all select-none ${
                      isDragging
                        ? "opacity-30 bg-[var(--secondary)]"
                        : "hover:bg-[var(--secondary)]/30"
                    } ${
                      isOver
                        ? "border-t-2 border-[var(--primary)] bg-[var(--primary)]/10"
                        : ""
                    }`}
                  >
                    {/* Drag Handle & Up/Down Arrows */}
                    <td className="px-3 py-3 text-center align-middle">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className="cursor-grab active:cursor-grabbing p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                          title="Drag to reorder"
                        >
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0 || isSavingOrder}
                            onClick={() => handleMoveUp(idx)}
                            className="p-0.5 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move category up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === categories.length - 1 || isSavingOrder}
                            onClick={() => handleMoveDown(idx)}
                            className="p-0.5 rounded hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="Move category down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-[var(--foreground)]">
                      <div>{cat.name}</div>
                      {cat.description && (
                        <div className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 font-normal">
                          {cat.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                      /{cat.slug}
                    </td>
                    <td className="px-4 py-3.5 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[11px] font-semibold text-[var(--foreground)]">
                        {cat.sort_order}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {cat.is_active ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500">
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
                          title="Edit category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          {deletingId === cat.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="No categories configured yet"
          description="Categories organize your downloads and digital assets. Create your first category above."
          actionText="Add First Category"
          onAction={() => setShowAddForm(true)}
        />
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">Edit Category</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => handleEditNameChange(e.target.value)}
                    placeholder="e.g. Developer Tools"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    placeholder="developer-tools"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Brief summary of resources included..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="rounded text-[var(--primary)]"
                    />
                    <span>Active (Publicly Visible)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-[var(--secondary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 shadow-sm"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editLoading ? "Updating..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
