"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Layers,
  HardDrive,
  Globe,
  DollarSign,
  FileText,
} from "lucide-react";
import type { Resource, Category } from "@/types/database";
import { ResourceVisual } from "@/components/resources/resource-visual";

interface ResourceFormProps {
  categories: Category[];
  initialData?: Resource;
  isEdit?: boolean;
}

export function ResourceForm({
  categories,
  initialData,
  isEdit = false,
}: ResourceFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [resourceType, setResourceType] = useState(initialData?.resource_type || "SOFTWARE");
  const [accessType, setAccessType] = useState(initialData?.access_type || "FREE");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "0");
  const [salePrice, setSalePrice] = useState(initialData?.sale_price ? String(initialData.sale_price) : "");
  const [platform, setPlatform] = useState(initialData?.platform || "Windows");
  const [version, setVersion] = useState(initialData?.version || "");
  const [versionCode, setVersionCode] = useState(initialData?.version_code ? String(initialData.version_code) : "");
  const [packageName, setPackageName] = useState(initialData?.package_name || "");
  const [sizeBytes, setSizeBytes] = useState(initialData?.size_bytes ? String(initialData.size_bytes) : "");
  const [developer, setDeveloper] = useState(initialData?.developer || "");
  const [license, setLicense] = useState(initialData?.license || "MIT");
  const [officialUrl, setOfficialUrl] = useState(initialData?.official_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || "");
  const [iconUrl, setIconUrl] = useState(initialData?.icon_url || "");
  const [changelog, setChangelog] = useState(initialData?.changelog || "");
  const [systemRequirements, setSystemRequirements] = useState(initialData?.system_requirements || "");
  const [status, setStatus] = useState(initialData?.status || "PUBLISHED");
  const [featured, setFeatured] = useState(!!initialData?.featured);
  const [hasPermission, setHasPermission] = useState(isEdit ? true : false);

  // Download links state (Direct URLs saved in Supabase)
  const [downloadLinks, setDownloadLinks] = useState<any[]>(
    initialData?.download_links && initialData.download_links.length > 0
      ? initialData.download_links
      : [{ title: "Primary Download", link_type: "PRIMARY", url: "", size_bytes: "" }]
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const addDownloadLink = () => {
    setDownloadLinks((prev) => [
      ...prev,
      { title: `Mirror ${prev.length}`, link_type: "MIRROR", url: "", size_bytes: "" },
    ]);
  };

  const removeDownloadLink = (index: number) => {
    setDownloadLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateDownloadLink = (index: number, field: string, value: any) => {
    setDownloadLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMsg("Title and slug are required.");
      return;
    }
    if (!hasPermission) {
      setErrorMsg("You must certify that you have legal permission to distribute this resource.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category_id: categoryId || null,
      short_description: shortDescription.trim() || null,
      description: description.trim() || null,
      resource_type: resourceType,
      access_type: accessType,
      price: Number(price) || 0,
      sale_price: salePrice ? Number(salePrice) : null,
      platform: platform.trim() || null,
      version: version.trim() || null,
      version_code: versionCode ? Number(versionCode) : null,
      package_name: packageName.trim() || null,
      size_bytes: sizeBytes ? Number(sizeBytes) : null,
      developer: developer.trim() || null,
      license: license.trim() || null,
      official_url: officialUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      icon_url: iconUrl.trim() || null,
      changelog: changelog.trim() || null,
      system_requirements: systemRequirements.trim() || null,
      status,
      featured,
      download_links: downloadLinks.filter((l) => l.url && l.url.trim()),
    };

    try {
      const endpoint = isEdit
        ? `/api/admin/resources/${initialData?.id}`
        : "/api/admin/resources";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save resource.");
      } else {
        router.push("/admin/resources");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error submitting resource.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/resources"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resources</span>
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? "Update Resource" : "Create Resource"}</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Basic Information Card */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Resource Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. VLC Media Player"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Slug / URL Identifier *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="vlc-media-player"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Resource Type
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            >
              <option value="SOFTWARE">PC Software</option>
              <option value="APK">Android APK</option>
              <option value="DOWNLOAD">Downloadable File</option>
              <option value="EXTERNAL_LINK">External Website Link</option>
              <option value="GAME">Game</option>
              <option value="DIGITAL_PRODUCT">Digital Product / Asset</option>
              <option value="MEDIA">Authorized Media</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Access Type
            </label>
            <select
              value={accessType}
              onChange={(e) => setAccessType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            >
              <option value="FREE">Free Resource</option>
              <option value="PAID">Paid / Commercial (Requires Payment)</option>
              <option value="EXTERNAL">External Website</option>
            </select>
          </div>
        </div>

        {accessType === "PAID" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border)]">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Standard Price (₹ INR) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="499"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Discounted Sale Price (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="299"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Short Tagline / Summary
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief 1-2 sentence description for cards and search results..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Full Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive overview of features, usage guidelines, and context..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
          />
        </div>
      </div>

      {/* 2. Technical Metadata Card */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
          Technical Specifications & Licensing
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Operating System / Platform
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g. Windows, Android, Linux"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Version String
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g. 3.0.18"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              File Size (in Bytes)
            </label>
            <input
              type="number"
              value={sizeBytes}
              onChange={(e) => setSizeBytes(e.target.value)}
              placeholder="41943040 for 40MB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Developer / Author
            </label>
            <input
              type="text"
              value={developer}
              onChange={(e) => setDeveloper(e.target.value)}
              placeholder="e.g. VideoLAN Organization"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              License
            </label>
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              placeholder="e.g. GPL-2.0, MIT, Freeware"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Official Website URL
            </label>
            <input
              type="url"
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
            />
          </div>
        </div>

        {/* Optional APK Specific fields */}
        {resourceType === "APK" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Android Package Name
              </label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="org.videolan.vlc"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Version Code
              </label>
              <input
                type="number"
                value={versionCode}
                onChange={(e) => setVersionCode(e.target.value)}
                placeholder="30180"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-mono"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Changelog
            </label>
            <textarea
              rows={3}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="- Added support for dark theme&#10;- Fixed memory leak"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              System Requirements
            </label>
            <textarea
              rows={3}
              value={systemRequirements}
              onChange={(e) => setSystemRequirements(e.target.value)}
              placeholder="Windows 10/11 64-bit, 4GB RAM minimum"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] resize-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Media & Icons */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Media & Icon Assets
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Images are optional. If left blank, a stylish modern app/file icon format will be automatically generated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Thumbnail URL <span className="text-[var(--muted-foreground)] font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://.../screenshot.webp (leave blank for default icon)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Icon URL <span className="text-[var(--muted-foreground)] font-normal">(Optional - Custom logo)</span>
            </label>
            <input
              type="url"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://.../logo.png (leave blank for default icon)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
            />
          </div>
        </div>

        {/* Live Default Icon Preview */}
        <div className="pt-4 border-t border-[var(--border)]">
          <label className="block text-xs font-semibold text-[var(--foreground)] mb-2">
            Live Default App/File Icon Preview
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
            <div className="w-full sm:w-48 flex-shrink-0">
              <ResourceVisual
                resource={{
                  title: title || "App Title Preview",
                  resource_type: resourceType,
                  platform,
                  category: categories.find((c) => c.id === categoryId),
                  thumbnail_url: thumbnailUrl,
                  icon_url: iconUrl,
                }}
                variant="card"
                showFormatTag={true}
              />
            </div>
            <div className="flex-1 text-xs text-[var(--muted-foreground)] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-[var(--foreground)]">Interactive Visual Format</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This exact modern icon layout will be displayed across the homepage, category pages, search results, and detail pages. You do not need to design or upload custom banners!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Download Links Configuration (Pure Direct URLs - Supabase Stored) */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
              Download Sources & Direct URLs
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Direct download links stored safely in your Supabase database. No Cloudflare R2 storage needed!
            </p>
          </div>
          <button
            type="button"
            onClick={addDownloadLink}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mirror Link</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold">Direct Download Links (Supabase Database):</span> You can paste any direct download URL from Google Drive, Mediafire, Mega, GitHub Releases, Dropbox, or any direct server URL. Users will download directly from your provided link.
          </div>
        </div>

        <div className="space-y-3">
          {downloadLinks.map((link, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs"
            >
              <input
                type="text"
                value={link.title}
                onChange={(e) => updateDownloadLink(idx, "title", e.target.value)}
                placeholder="Title (e.g. Fast Server, Google Drive)"
                className="sm:w-48 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
              />

              <select
                value={link.link_type}
                onChange={(e) => updateDownloadLink(idx, "link_type", e.target.value)}
                className="sm:w-40 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] font-medium"
              >
                <option value="PRIMARY">Primary Download</option>
                <option value="MIRROR">Mirror Link</option>
                <option value="EXTERNAL">External / Official</option>
              </select>

              <input
                type="url"
                value={link.url || ""}
                onChange={(e) => updateDownloadLink(idx, "url", e.target.value)}
                placeholder="Direct Download URL (https://drive.google.com/... or https://mediafire.com/...)"
                className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] font-mono text-[var(--foreground)]"
              />

              {downloadLinks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDownloadLink(idx)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                  aria-label="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Status & Legal Attestation */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
          Publishing & Distribution Rights
        </h3>

        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] font-semibold"
            >
              <option value="PUBLISHED">Published (Live to public)</option>
              <option value="DRAFT">Draft (Hidden from public)</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-4">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded text-[var(--primary)]"
            />
            <span className="text-xs font-medium text-[var(--foreground)]">
              Feature on Homepage Showcase
            </span>
          </label>
        </div>

        {/* Legal Attestation Checkbox */}
        <div className="pt-4 border-t border-[var(--border)]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={hasPermission}
              onChange={(e) => setHasPermission(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              <strong className="text-[var(--foreground)]">Legal Compliance Certification:</strong>{" "}
              I certify that this platform possesses legal distribution rights, authorized permission, or an open-source license to distribute this file or link.
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}
