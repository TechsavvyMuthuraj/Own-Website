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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-900/50 backdrop-blur-xl shadow-xs">
        {/* Reordering helper note */}
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
          <ArrowUpDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>
            Drag rows using the <strong className="text-neutral-900 dark:text-white font-mono">⠿</strong> grip or use{" "}
            <strong className="text-neutral-900 dark:text-white">↑ ↓</strong> arrows to reorganize navigation hierarchy.
          </span>
          {isSavingOrder && (
            <span className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse ml-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving order...</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "+ Add Category"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-900/50 backdrop-blur-xl shadow-xs space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Create New Taxonomy Node</span>
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Developer Tools"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. developer-tools"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of resources included..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white font-mono"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-800 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Active (Publicly Visible)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-xs cursor-pointer"
          >
            {loading ? "Saving..." : "Save Category"}
          </button>
        </form>
      )}

      {categories.length > 0 ? (
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-50/90 dark:bg-neutral-950/70 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800 text-[10px]">
                <tr>
                  <th className="w-20 px-4 py-4 text-center">Reorder</th>
                  <th className="px-6 py-4">Category Details</th>
                  <th className="px-4 py-4">Routing Slug</th>
                  <th className="px-4 py-4">Hierarchy #</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/60">
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
                          ? "opacity-30 bg-neutral-200 dark:bg-neutral-800"
                          : "hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30"
                      } ${
                        isOver
                          ? "border-t-2 border-indigo-500 bg-indigo-500/10"
                          : ""
                      }`}
                    >
                      {/* Drag Handle & Up/Down Arrows */}
                      <td className="px-4 py-4 text-center align-middle">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={idx === 0 || isSavingOrder}
                              onClick={() => handleMoveUp(idx)}
                              className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title="Move category up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === categories.length - 1 || isSavingOrder}
                              onClick={() => handleMoveDown(idx)}
                              className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                              title="Move category down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">{cat.name}</div>
                        {cat.description && (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 font-normal mt-0.5">
                            {cat.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-neutral-600 dark:text-neutral-400 text-[11px]">
                        /{cat.slug}
                      </td>
                      <td className="px-4 py-4 font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          #{cat.sort_order}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {cat.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                            DISABLED
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-500/15 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all shadow-xs cursor-pointer"
                            title="Edit category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            disabled={deletingId === cat.id}
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-white dark:bg-neutral-800/60 hover:bg-red-50 dark:hover:bg-red-500/15 text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 transition-all shadow-xs cursor-pointer"
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

          <div className="px-6 py-3.5 bg-neutral-50/90 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              <span>
                Total <strong className="text-neutral-900 dark:text-white">{categories.length}</strong> taxonomy categories configured
              </span>
            </div>
            <div className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
              SUPABASE TAXONOMY SCHEMA ACTIVE
            </div>
          </div>
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
