"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Layers, Loader2, Check, AlertCircle } from "lucide-react";
import type { Category } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";

interface CategoriesClientProps {
  initialCategories: Category[];
}

export function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
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
          sort_order: Number(sortOrder) || 0,
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create category");
      } else {
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

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete category.");
      }
    } catch {
      alert("Error deleting category.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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

      {initialCategories.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-4 py-3.5">Slug</th>
                <th className="px-4 py-3.5">Sort</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[var(--foreground)]">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                    /{cat.slug}
                  </td>
                  <td className="px-4 py-3.5 font-mono">{cat.sort_order}</td>
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
                  </td>
                </tr>
              ))}
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
    </div>
  );
}
