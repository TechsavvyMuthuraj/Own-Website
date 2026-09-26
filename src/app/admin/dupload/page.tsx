"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CloudUpload,
  Upload,
  FolderPlus,
  Folder,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Search,
  RefreshCw,
  Trash2,
  HardDrive,
  DollarSign,
  Users,
  Share2,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Link2,
  Globe,
  Lock,
  ArrowRight,
  Filter,
  Download,
  Eye,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  Sparkles,
  ChevronRight,
  Layers,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import {
  DEFAULT_DUPLOAD_SETTINGS,
  DuploadSettings,
  DuploadAccountInfo,
  DuploadFileItem,
  DuploadFolderItem,
} from "@/config/dupload";

export default function DuploadAdminPage() {
  // Active Tab: 'files' | 'upload' | 'remote' | 'account' | 'share' | 'settings'
  const [activeTab, setActiveTab] = useState<"files" | "upload" | "remote" | "account" | "share" | "settings">("files");

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<DuploadSettings>(DEFAULT_DUPLOAD_SETTINGS);
  const [account, setAccount] = useState<DuploadAccountInfo | null>(null);
  const [folders, setFolders] = useState<DuploadFolderItem[]>([]);
  const [files, setFiles] = useState<DuploadFileItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New Folder Creation State
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Direct Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadBytesText, setUploadBytesText] = useState("");
  const [uploadedResult, setUploadedResult] = useState<{
    name: string;
    link: string;
    file_code: string;
    size: number;
  } | null>(null);

  // Remote URL Upload State
  const [remoteUrlsText, setRemoteUrlsText] = useState("");
  const [remoteFolder, setRemoteFolder] = useState("");
  const [remoteTosAgreed, setRemoteTosAgreed] = useState(true);
  const [remoteUploading, setRemoteUploading] = useState(false);
  const [remoteResults, setRemoteResults] = useState<Array<{
    url: string;
    success: boolean;
    file_code?: string;
    link?: string;
    error?: string;
  }> | null>(null);

  // Settings edit state
  const [editApiKey, setEditApiKey] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editReferralUrl, setEditReferralUrl] = useState("");
  const [editAllFilesUrl, setEditAllFilesUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Quick Share Generator State
  const [shareTargetFile, setShareTargetFile] = useState<DuploadFileItem | null>(null);
  const [shareFormat, setShareFormat] = useState<"direct" | "markdown" | "html" | "community">("direct");

  // Deletion & Trash State
  const [fileToDelete, setFileToDelete] = useState<DuploadFileItem | null>(null);
  const [deletingFileCode, setDeletingFileCode] = useState<string | null>(null);
  const [selectedFileCodes, setSelectedFileCodes] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState<Array<{ file_code: string; name?: string; size?: string | number; deleted_at?: string }>>([]);
  const [deletedCount, setDeletedCount] = useState(0);
  const [restoringFileCode, setRestoringFileCode] = useState<string | null>(null);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // Load Overview Data from Backend
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/admin/dupload?action=overview");
      if (!res.ok) throw new Error("Failed to load DUpload data");
      const data = await res.json();

      if (data.success) {
        setSettings(data.settings || DEFAULT_DUPLOAD_SETTINGS);
        setAccount(data.account);
        setFolders(data.folders || []);
        setFiles(data.files || []);
        setDeletedFiles(data.deletedFiles || []);
        setDeletedCount(data.deletedCount || 0);

        setEditApiKey(data.settings?.apiKey || DEFAULT_DUPLOAD_SETTINGS.apiKey);
        setEditUsername(data.settings?.username || DEFAULT_DUPLOAD_SETTINGS.username);
        setEditReferralUrl(data.settings?.referralUrl || DEFAULT_DUPLOAD_SETTINGS.referralUrl);
        setEditAllFilesUrl(data.settings?.allFilesUrl || DEFAULT_DUPLOAD_SETTINGS.allFilesUrl);
        if (data.settings?.defaultFolderId) {
          setUploadFolder(data.settings.defaultFolderId);
          setRemoteFolder(data.settings.defaultFolderId);
        }
      }
    } catch (err) {
      console.error("Error loading DUpload data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Show auto-dismissing toast
  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 4000);
  };

  // Delete Single File Handler
  const handleDeleteSingleFile = async () => {
    if (!fileToDelete) return;
    const target = fileToDelete;
    setDeletingFileCode(target.file_code);

    try {
      const res = await fetch("/api/admin/dupload?action=delete_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_code: target.file_code,
          name: target.name,
          size: target.size,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFiles((prev) => prev.filter((f) => f.file_code !== target.file_code));
        setSelectedFileCodes((prev) => prev.filter((c) => c !== target.file_code));
        setDeletedFiles((prev) => [
          { file_code: target.file_code, name: target.name, size: target.size, deleted_at: new Date().toISOString() },
          ...prev,
        ]);
        setDeletedCount((prev) => prev + 1);
        setFileToDelete(null);
        triggerToast(`File "${target.name}" deleted successfully.`);
        await loadData(true);
      } else {
        alert(data.error || "Failed to delete file");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete file");
    } finally {
      setDeletingFileCode(null);
    }
  };

  // Bulk Delete Files Handler
  const handleBulkDelete = async () => {
    if (selectedFileCodes.length === 0) return;
    setBulkDeleting(true);

    try {
      const targets = files.filter((f) => selectedFileCodes.includes(f.file_code));
      const res = await fetch("/api/admin/dupload?action=bulk_delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: targets.map((f) => ({
            file_code: f.file_code,
            name: f.name,
            size: f.size,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const count = selectedFileCodes.length;
        setFiles((prev) => prev.filter((f) => !selectedFileCodes.includes(f.file_code)));
        setSelectedFileCodes([]);
        setShowBulkDeleteModal(false);
        triggerToast(`${count} files deleted successfully.`);
        await loadData(true);
      } else {
        alert(data.error || "Failed to delete files");
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete files");
    } finally {
      setBulkDeleting(false);
    }
  };

  // Restore File from Trash Handler
  const handleRestoreFile = async (fileCode: string) => {
    setRestoringFileCode(fileCode);
    try {
      const res = await fetch("/api/admin/dupload?action=restore_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_code: fileCode, target_fld_id: "0" }),
      });

      const data = await res.json();
      if (data.success) {
        setDeletedFiles((prev) => prev.filter((f) => f.file_code !== fileCode));
        setDeletedCount((prev) => Math.max(0, prev - 1));
        triggerToast("File restored back to library.");
        await loadData(true);
      } else {
        alert(data.error || "Failed to restore file");
      }
    } catch (err: any) {
      alert(err.message || "Failed to restore file");
    } finally {
      setRestoringFileCode(null);
    }
  };

  // Empty Trash Handler
  const handleEmptyTrash = async () => {
    if (!confirm("Are you sure you want to permanently clear the Trash list?")) return;
    try {
      const res = await fetch("/api/admin/dupload?action=empty_trash", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setDeletedFiles([]);
        setDeletedCount(0);
        triggerToast("Trash list emptied.");
        await loadData(true);
      } else {
        alert(data.error || "Failed to empty trash");
      }
    } catch (err: any) {
      alert(err.message || "Failed to empty trash");
    }
  };

  // Toggle Selection Helper
  const toggleSelectFile = (fileCode: string) => {
    setSelectedFileCodes((prev) =>
      prev.includes(fileCode) ? prev.filter((c) => c !== fileCode) : [...prev, fileCode]
    );
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Copy helper with feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  // Format bytes helper
  const formatBytes = (bytes: number | string) => {
    const num = Number(bytes);
    if (isNaN(num) || num === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setCreatingFolder(true);
    try {
      const res = await fetch("/api/admin/dupload?action=create_folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewFolderName("");
        await loadData(true);
      } else {
        alert(data.error || "Failed to create folder");
      }
    } catch (e: any) {
      alert(e.message || "Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  // Direct File Upload with Real Browser XMLHttpRequest (No Next.js body limits, Real Progress for 50MB-500MB!)
  const handleDirectUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadBytesText("Requesting upload session from DUpload...");
    setUploadedResult(null);

    try {
      // Step 1: Request upload server & session from backend
      const serverRes = await fetch("/api/admin/dupload?action=upload_server");
      const serverData = await serverRes.json();

      if (!serverData.success || !serverData.upload_url || !serverData.sess_id) {
        throw new Error(serverData.error || "Failed to obtain DUpload upload server session");
      }

      const uploadUrl = serverData.upload_url;
      const sessId = serverData.sess_id;

      // Step 2: Prepare FormData for DUpload server directly
      const formData = new FormData();
      formData.append("sess_id", sessId);
      formData.append("utype", "reg");
      if (uploadFolder) {
        formData.append("fld_id", uploadFolder);
      }
      formData.append("file_0", selectedUploadFile, selectedUploadFile.name);

      setUploadBytesText(`Uploading ${selectedUploadFile.name}...`);

      // Step 3: Direct XMLHttpRequest to DUpload upload server (supports CORS!)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
            setUploadProgress(percent);
            setUploadBytesText(
              `${formatBytes(event.loaded)} of ${formatBytes(event.total)} (${percent}%)`
            );
          }
        };

        xhr.onload = async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resData = JSON.parse(xhr.responseText);
              if (Array.isArray(resData) && resData[0]?.file_code) {
                const fileCode = resData[0].file_code;
                const link = `https://dupload.net/${fileCode}`;

                // If folder was selected, ensure file moved into target folder
                if (uploadFolder) {
                  try {
                    await fetch("/api/admin/dupload?action=move_file", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ file_code: fileCode, fld_id: uploadFolder }),
                    });
                  } catch (e) {
                    console.warn("Folder placement warning:", e);
                  }
                }

                setUploadProgress(100);
                setUploadBytesText("Upload complete!");
                setUploadedResult({
                  name: selectedUploadFile.name,
                  link,
                  file_code: fileCode,
                  size: selectedUploadFile.size,
                });
                setSelectedUploadFile(null);
                await loadData(true);
                resolve();
              } else {
                reject(new Error(xhr.responseText || "Unexpected server response"));
              }
            } catch (err: any) {
              reject(new Error(`Failed to parse response: ${xhr.responseText.slice(0, 200)}`));
            }
          } else {
            reject(new Error(`Server returned status ${xhr.status}: ${xhr.responseText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network connection error to DUpload server"));
        };

        xhr.send(formData);
      });
    } catch (err: any) {
      console.error("Direct upload error:", err);
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Remote URL Upload
  const handleRemoteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = remoteUrlsText
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) {
      alert("Please enter at least one URL");
      return;
    }

    setRemoteUploading(true);
    setRemoteResults(null);

    try {
      const res = await fetch("/api/admin/dupload?action=remote_upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, fld_id: remoteFolder }),
      });

      const data = await res.json();
      if (data.success) {
        setRemoteResults(data.results);
        setRemoteUrlsText("");
        await loadData(true);
      } else {
        alert(data.error || "Remote upload failed");
      }
    } catch (err: any) {
      alert(err.message || "Remote upload error");
    } finally {
      setRemoteUploading(false);
    }
  };

  // Move File to Folder
  const handleMoveFile = async (fileCode: string, targetFldId: string) => {
    try {
      const res = await fetch("/api/admin/dupload?action=move_file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_code: fileCode, fld_id: targetFldId }),
      });
      const data = await res.json();
      if (data.success) {
        await loadData(true);
      } else {
        alert(data.error || "Failed to move file");
      }
    } catch (err: any) {
      alert(err.message || "Failed to move file");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch("/api/admin/dupload?action=save_settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: editApiKey,
          username: editUsername,
          referralUrl: editReferralUrl,
          allFilesUrl: editAllFilesUrl,
          defaultFolderId: uploadFolder,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
        await loadData(true);
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered files based on search & folder (including Trash view)
  const filteredFiles: DuploadFileItem[] = useMemo(() => {
    if (selectedFolder === "trash") {
      const mapped: DuploadFileItem[] = (deletedFiles || []).map((df) => ({
        file_code: df.file_code,
        name: df.name || df.file_code,
        size: df.size || 0,
        uploaded: df.deleted_at ? new Date(df.deleted_at).toLocaleString() : "Deleted",
        downloads: 0,
        public: "1",
        fld_id: "trash",
        link: `https://dupload.net/${df.file_code}`,
      }));
      return mapped.filter((f) => {
        return (
          searchQuery.trim() === "" ||
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.file_code.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    return files.filter((f) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.file_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFolder =
        selectedFolder === "all" ||
        String(f.fld_id) === String(selectedFolder);

      return matchesSearch && matchesFolder;
    });
  }, [files, deletedFiles, searchQuery, selectedFolder]);

  // Storage Stats Calculation
  const totalStorageBytes = 62914560000; // ~59 GB Free tier
  const usedStorageBytes = Number(account?.storage_used || 0);
  const leftStorageBytes = Number(account?.storage_left || totalStorageBytes);
  const usedPercentage = Math.min(100, Math.round((usedStorageBytes / totalStorageBytes) * 100));

  // File Icon Picker
  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || ""))
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext || ""))
      return <FileImage className="w-5 h-5 text-emerald-500" />;
    if (["mp4", "mkv", "avi", "mov", "webm"].includes(ext || ""))
      return <FileVideo className="w-5 h-5 text-indigo-500" />;
    if (["mp3", "wav", "ogg", "flac"].includes(ext || ""))
      return <FileAudio className="w-5 h-5 text-pink-500" />;
    if (["pdf", "doc", "docx", "txt"].includes(ext || ""))
      return <FileText className="w-5 h-5 text-blue-500" />;
    if (["xlsx", "xls", "csv"].includes(ext || ""))
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    if (["js", "ts", "html", "css", "py", "java", "json"].includes(ext || ""))
      return <FileCode className="w-5 h-5 text-purple-500" />;
    return <FileText className="w-5 h-5 text-neutral-400" />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* ── Top Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-neutral-900/60 to-neutral-950 p-6 sm:p-8 text-neutral-100 shadow-xl">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold uppercase tracking-wider">
              <CloudUpload className="w-3.5 h-3.5" />
              <span>DUpload Cloud Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>DUpload Storage & File Sharing</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live API Connected
              </span>
            </h1>

            <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
              Upload, organize, host, and share download files directly via your{" "}
              <strong className="text-white">dupload.net</strong> account with real-time remote leeching, folder
              management, and 1-click sharing to NammaTech community and resources.
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-bold text-neutral-200 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Cloud"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New File</span>
            </button>

            <a
              href="https://dupload.net/?op=my_account"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/70 hover:bg-neutral-900 text-neutral-400 hover:text-white text-xs transition-colors"
            >
              <span>DUpload.net</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-800/80">
          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-sky-400" />
              <span>Storage Used</span>
            </span>
            <div className="text-lg font-black text-white mt-1">
              {formatBytes(usedStorageBytes)}
              <span className="text-xs text-neutral-500 font-normal"> / 59 GB</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all"
                style={{ width: `${Math.max(2, usedPercentage)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Current Balance</span>
            </span>
            <div className="text-lg font-black text-emerald-400 mt-1">
              ${account?.balance || "0.00"}
            </div>
            <span className="text-[10px] text-neutral-500">Free Tier Rewards</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Hosted Files</span>
            </span>
            <div className="text-lg font-black text-white mt-1">{files.length} Files</div>
            <span className="text-[10px] text-neutral-500">{folders.length} Folders Organized</span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Account User</span>
            </span>
            <div className="text-sm font-black text-white mt-1 truncate">
              {settings.username}
            </div>
            <span className="text-[10px] text-neutral-500 truncate block">
              {account?.email || settings.email}
            </span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("files")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "files"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>My Files & Folders</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
            {files.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "upload"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Direct File Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("remote")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "remote"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Remote URL Leech</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "account"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Account & Referral Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("share")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "share"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Quick Share & Embed</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === "settings"
              ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>API Key & Settings</span>
        </button>
      </div>

      {/* ── TAB 1: FILE MANAGER ── */}
      {activeTab === "files" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Folders Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-4 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-sky-400" />
                  <span>Folders</span>
                </span>
                <span className="text-[11px] text-neutral-500">{folders.length} Folders</span>
              </div>

              {/* Add Folder Form */}
              <form onSubmit={handleCreateFolder} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={creatingFolder || !newFolderName.trim()}
                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Create Folder"
                  >
                    {creatingFolder ? "..." : <FolderPlus className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              {/* Folder List */}
              <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedFolder("all")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    selectedFolder === "all"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Layers className="w-3.5 h-3.5" />
                    <span>All Files</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                    {files.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFolder("0")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    selectedFolder === "0"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold"
                      : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Root / Uncategorized</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                    {files.filter((f) => String(f.fld_id) === "0").length}
                  </span>
                </button>

                {folders.map((fld) => (
                  <button
                    key={fld.fld_id}
                    type="button"
                    onClick={() => {
                      setSelectedFolder(String(fld.fld_id));
                      setSelectedFileCodes([]);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      selectedFolder === String(fld.fld_id)
                        ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold"
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 text-amber-500" />
                      <span className="truncate">{fld.name}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono">
                      #{fld.fld_id}
                    </span>
                  </button>
                ))}

                {/* Trash / Deleted Section */}
                <div className="pt-2 border-t border-neutral-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolder("trash");
                      setSelectedFileCodes([]);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      selectedFolder === "trash"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                        : "text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Trash / Deleted</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 font-mono">
                      {deletedFiles.length || deletedCount}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-4 rounded-3xl border border-neutral-800/80 bg-neutral-900/30 text-xs space-y-2 text-neutral-400">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DUpload Monetization</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every download through your links pays up to <strong className="text-white">$10+ CPM</strong> on DUpload.
                Share your links on NammaTech Community Hub or Resource download buttons!
              </p>
            </div>
          </div>

          {/* Right Column: Files Table */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Search files by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">
                  Showing <strong className="text-white">{filteredFiles.length}</strong> of {files.length}
                </span>

                {selectedFolder === "trash" && deletedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleEmptyTrash}
                    className="px-3 py-2 rounded-xl bg-red-600/20 border border-red-500/30 hover:bg-red-600/30 text-xs font-bold text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Clear all deleted files history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Empty Trash</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const allLinks = filteredFiles.map((f) => f.link).join("\n");
                    handleCopy(allLinks, "all-links");
                  }}
                  className="px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-xs font-semibold text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy all filtered file links"
                >
                  {copiedLink === "all-links" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Copy All URLs</span>
                </button>
              </div>
            </div>

            {/* Bulk Selection Bar */}
            {selectedFileCodes.length > 0 && selectedFolder !== "trash" && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-neutral-900 to-neutral-950 border border-sky-500/30 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                    {selectedFileCodes.length} Selected
                  </span>
                  <span className="text-neutral-300 font-medium">files selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const links = files.filter(f => selectedFileCodes.includes(f.file_code)).map(f => f.link).join("\n");
                      handleCopy(links, "bulk-copy");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-sky-400" />
                    <span>Copy Selected URLs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedFileCodes.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFileCodes([])}
                    className="px-2 py-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer text-xs"
                  >
                    Deselect
                  </button>
                </div>
              </div>
            )}

            {/* Files Table Card */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-md overflow-hidden shadow-xl">
              {loading ? (
                <div className="p-12 text-center text-neutral-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400" />
                  <p className="text-sm font-semibold">Fetching your DUpload files from cloud...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="p-12 text-center text-neutral-400 space-y-3">
                  <Folder className="w-12 h-12 mx-auto text-neutral-600 stroke-[1.5]" />
                  <h4 className="text-base font-bold text-white">
                    {selectedFolder === "trash" ? "Trash is Empty" : "No files found"}
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    {selectedFolder === "trash"
                      ? "No deleted files in your Trash bin."
                      : searchQuery
                      ? "No files matched your search keyword."
                      : "No files in this folder yet. Use Direct Upload or Remote Leech to add files!"}
                  </p>
                  {selectedFolder !== "trash" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload First File</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-950/70 text-neutral-400 font-bold">
                        <th className="py-3 px-3 w-8">
                          {selectedFolder !== "trash" && (
                            <input
                              type="checkbox"
                              checked={filteredFiles.length > 0 && selectedFileCodes.length === filteredFiles.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFileCodes(filteredFiles.map((f) => f.file_code));
                                } else {
                                  setSelectedFileCodes([]);
                                }
                              }}
                              className="rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                            />
                          )}
                        </th>
                        <th className="py-3 px-4">Filename / File Code</th>
                        <th className="py-3 px-4">Size</th>
                        <th className="py-3 px-4">{selectedFolder === "trash" ? "Deleted At" : "Uploaded"}</th>
                        <th className="py-3 px-4 text-center">{selectedFolder === "trash" ? "Status" : "Downloads"}</th>
                        <th className="py-3 px-4">{selectedFolder === "trash" ? "Location" : "Folder"}</th>
                        <th className="py-3 px-4 text-right">Actions & Share</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {filteredFiles.map((file) => (
                        <tr
                          key={file.file_code}
                          className="hover:bg-neutral-800/30 transition-colors group"
                        >
                          {/* Selection Checkbox */}
                          <td className="py-3 px-3 w-8">
                            {selectedFolder !== "trash" && (
                              <input
                                type="checkbox"
                                checked={selectedFileCodes.includes(file.file_code)}
                                onChange={() => toggleSelectFile(file.file_code)}
                                className="rounded border-neutral-700 bg-neutral-900 text-sky-500 focus:ring-0 cursor-pointer"
                              />
                            )}
                          </td>

                          {/* File Name & Code */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 shrink-0">
                                {getFileIcon(file.name)}
                              </div>
                              <div className="min-w-0 max-w-[240px] sm:max-w-[320px]">
                                <a
                                  href={file.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-bold text-white hover:text-sky-400 transition-colors truncate block text-xs"
                                  title={file.name}
                                >
                                  {file.name}
                                </a>
                                <span className="text-[11px] font-mono text-neutral-500">
                                  code: {file.file_code}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Size */}
                          <td className="py-3 px-4 font-mono text-neutral-300 whitespace-nowrap">
                            {formatBytes(file.size)}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-4 text-neutral-400 whitespace-nowrap text-[11px]">
                            {file.uploaded}
                          </td>

                          {/* Downloads / Status */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {selectedFolder === "trash" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold text-[10px] border border-red-500/20">
                                In Trash
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-sky-400 font-bold text-[11px]">
                                <Download className="w-3 h-3" />
                                <span>{file.downloads}</span>
                              </span>
                            )}
                          </td>

                          {/* Folder Selector */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {selectedFolder === "trash" ? (
                              <span className="text-neutral-400 font-mono text-[11px]">Trash / Bin</span>
                            ) : (
                              <select
                                value={String(file.fld_id || "0")}
                                onChange={(e) => handleMoveFile(file.file_code, e.target.value)}
                                className="px-2 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 focus:outline-none focus:border-sky-500 cursor-pointer"
                                title="Move to another folder"
                              >
                                <option value="0">Root (No Folder)</option>
                                {folders.map((f) => (
                                  <option key={f.fld_id} value={String(f.fld_id)}>
                                    {f.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>

                          {/* Actions & Share */}
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {selectedFolder === "trash" ? (
                              <button
                                type="button"
                                onClick={() => handleRestoreFile(file.file_code)}
                                disabled={restoringFileCode === file.file_code}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                                title="Restore file back to active library"
                              >
                                {restoringFileCode === file.file_code ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <RotateCcw className="w-3.5 h-3.5" />
                                )}
                                <span>Restore</span>
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                {/* 1-Click Copy Download Link */}
                                <button
                                  type="button"
                                  onClick={() => handleCopy(file.link, file.file_code)}
                                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                    copiedLink === file.file_code
                                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                      : "border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white"
                                  }`}
                                  title="Copy Direct Download Link"
                                >
                                  {copiedLink === file.file_code ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Share in Community Hub */}
                                <Link
                                  href={`/admin/community`}
                                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-sky-400 transition-colors"
                                  title="Share in Community Hub"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </Link>

                                {/* Open link */}
                                <a
                                  href={file.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                                  title="Open on DUpload"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>

                                {/* Delete Option */}
                                <button
                                  type="button"
                                  onClick={() => setFileToDelete(file)}
                                  disabled={deletingFileCode === file.file_code}
                                  className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-red-500/15 hover:border-red-500/40 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Delete File from DUpload"
                                >
                                  {deletingFileCode === file.file_code ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DIRECT FILE UPLOAD (Matches Image 3) ── */}
      {activeTab === "upload" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-400" />
                <span>Direct File Upload</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Upload files straight to your DUpload cloud account. Max file size: 500 MB (Free Tier).
              </p>
            </div>

            {/* Folder selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">
                Target Folder on DUpload:
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="">Root / Main Directory</option>
                {folders.map((f) => (
                  <option key={f.fld_id} value={String(f.fld_id)}>
                    📁 {f.name} (#{f.fld_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Area */}
            <form onSubmit={handleDirectUpload} className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setSelectedUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-sky-400 bg-sky-500/10 scale-[1.01]"
                    : selectedUploadFile
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : "border-neutral-800 hover:border-neutral-700 bg-neutral-950/60"
                }`}
                onClick={() => {
                  document.getElementById("dupload-file-input")?.click();
                }}
              >
                <input
                  id="dupload-file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedUploadFile(e.target.files[0]);
                    }
                  }}
                />

                <div className="space-y-4 pointer-events-none">
                  <div className="w-16 h-16 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto shadow-inner">
                    <CloudUpload
                      className={`w-8 h-8 ${
                        selectedUploadFile ? "text-emerald-400" : "text-sky-400"
                      }`}
                    />
                  </div>

                  {selectedUploadFile ? (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready to Upload: {selectedUploadFile.name}</span>
                      </div>
                      <p className="text-xs text-neutral-400 font-mono">
                        {formatBytes(selectedUploadFile.size)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-white">
                        Drag & drop or <span className="text-sky-400 underline">click here to select</span>
                      </div>
                      <p className="text-xs text-neutral-500">
                        Supports ZIP, RAR, APK, PDF, MP4, ISO, documents, & scripts
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar when uploading */}
              {uploading && (
                <div className="space-y-2.5 p-4 rounded-2xl bg-neutral-950 border border-sky-500/40 shadow-lg shadow-sky-500/10">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                      <span>{uploadBytesText || "Uploading to DUpload Servers..."}</span>
                    </span>
                    <span className="text-sky-400 font-mono text-sm">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-neutral-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                    <span>Direct Cloud Streaming</span>
                    <span className="text-emerald-400 font-semibold">CORS Accelerated ⚡</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                {selectedUploadFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedUploadFile(null)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-800 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!selectedUploadFile || uploading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-500 to-sky-600 hover:from-sky-400 hover:to-blue-400 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? "Uploading Now..." : "Upload to DUpload"}</span>
                </button>
              </div>
            </form>

            {/* Instant Result Card */}
            {uploadedResult && (
              <div className="p-5 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-3 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>File Uploaded Successfully!</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{uploadedResult.name}</div>
                    <div className="text-[11px] font-mono text-sky-400 truncate mt-0.5">
                      {uploadedResult.link}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(uploadedResult.link, "uploaded-link")}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink === "uploaded-link" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Link</span>
                    </button>

                    <a
                      href={uploadedResult.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                      title="Open Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: REMOTE URL UPLOAD (Matches Image 4) ── */}
      {activeTab === "remote" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-400" />
                <span>Remote URL Upload (Leech)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter direct downloadable URLs. DUpload cloud servers will download the files remotely and store them in your account.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-xs font-bold text-sky-400">⚡ Leech Rules & Limits:</div>
              <ul className="text-[11px] text-neutral-400 list-disc list-inside space-y-0.5">
                <li>You can leech up to 200 MB files daily on Free Tier.</li>
                <li>Enter up to 20 URLs, one URL per line.</li>
                <li>Files will be downloaded and processed in background.</li>
              </ul>
            </div>

            <form onSubmit={handleRemoteUpload} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Target Destination Folder:
                </label>
                <select
                  value={remoteFolder}
                  onChange={(e) => setRemoteFolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">Root / Main Directory</option>
                  {folders.map((f) => (
                    <option key={f.fld_id} value={String(f.fld_id)}>
                      📁 {f.name} (#{f.fld_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  URLs to Leech (One per row):
                </label>
                <textarea
                  rows={6}
                  placeholder={`https://example.com/software-v1.zip\nhttps://example.com/dataset.csv\nhttps://example.com/notes.pdf`}
                  value={remoteUrlsText}
                  onChange={(e) => setRemoteUrlsText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tos-check"
                  checked={remoteTosAgreed}
                  onChange={(e) => setRemoteTosAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 border-neutral-700 bg-neutral-900 cursor-pointer"
                />
                <label htmlFor="tos-check" className="text-xs text-neutral-400 cursor-pointer">
                  I agree to the DUpload terms of service and upload rules
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={remoteUploading || !remoteUrlsText.trim() || !remoteTosAgreed}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-sky-500/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{remoteUploading ? "Queueing Remote Leech..." : "Start Remote Upload"}</span>
                </button>
              </div>
            </form>

            {/* Remote Results */}
            {remoteResults && (
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                  Leech Queue Response:
                </h4>
                <div className="space-y-2">
                  {remoteResults.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        r.success
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-red-500/10 border-red-500/30 text-red-300"
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono">{r.url}</span>
                        {r.link && (
                          <div className="font-bold text-sky-400 mt-0.5">{r.link}</div>
                        )}
                        {r.error && (
                          <div className="text-[11px] text-red-400 mt-0.5">{r.error}</div>
                        )}
                      </div>

                      {r.link && (
                        <button
                          type="button"
                          onClick={() => handleCopy(r.link!, `remote-${i}`)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          {copiedLink === `remote-${i}` ? <Check className="w-3 h-3" /> : "Copy Link"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: ACCOUNT & REFERRAL HUB (Matches Image 1) ── */}
      {activeTab === "account" && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Profile Card */}
            <div className="md:col-span-1 p-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl text-center space-y-4 shadow-xl">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 p-1 mx-auto shadow-xl shadow-sky-500/20">
                <div className="w-full h-full rounded-full bg-neutral-950 flex items-center justify-center">
                  <span className="text-3xl font-black text-white">
                    {settings.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{settings.username}</h3>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-black uppercase tracking-wider">
                  {settings.accountType || "FREE ACCOUNT"}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="https://dupload.net/?op=payments"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Request Payout</span>
                </a>

                <a
                  href="https://dupload.net/?op=my_account"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-semibold text-xs transition-colors"
                >
                  Account Settings ↗
                </a>
              </div>
            </div>

            {/* Metrics & Details */}
            <div className="md:col-span-2 p-6 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h4 className="text-sm font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-sky-400" />
                  <span>Account Details & Cloud Links</span>
                </h4>
                <span className="text-xs text-emerald-400 font-bold">Status: Active</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Current Balance */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Current Balance:</span>
                  </span>
                  <span className="text-base font-black text-emerald-400">
                    ${account?.balance || "0.00"}
                  </span>
                </div>

                {/* Storage Usage */}
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-sky-400" />
                      <span>Storage Usage:</span>
                    </span>
                    <span className="font-bold text-white">
                      {formatBytes(usedStorageBytes)} of 59.00 GB
                    </span>
                  </div>
                  <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(2, usedPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* All Files Link */}
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    <span>All Files Public Folder:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settings.allFilesUrl}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.allFilesUrl, "all-files-url")}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink === "all-files-url" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Your DUpload Referral Link:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settings.referralUrl}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.referralUrl, "referral-url")}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink === "referral-url" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    Earn lifetime commissions on users who sign up through your referral link.
                  </span>
                </div>

                {/* API Key */}
                <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <span className="text-neutral-400 flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span>Active API Key:</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={settings.apiKey}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-emerald-400 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.apiKey, "api-key")}
                      className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink === "api-key" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: QUICK SHARE & EMBED HUB ── */}
      {activeTab === "share" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-sky-400" />
                <span>Quick Share & Embed Link Formatter</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Select any hosted DUpload file to generate ready-to-paste download cards, markdown links, or community posts.
              </p>
            </div>

            {/* Select File */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300">Choose a File:</label>
              <select
                value={shareTargetFile?.file_code || ""}
                onChange={(e) => {
                  const target = files.find((f) => f.file_code === e.target.value);
                  setShareTargetFile(target || null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="">-- Select a file from your account --</option>
                {files.map((f) => (
                  <option key={f.file_code} value={f.file_code}>
                    {f.name} ({formatBytes(f.size)})
                  </option>
                ))}
              </select>
            </div>

            {shareTargetFile && (
              <div className="space-y-4 pt-2">
                {/* Format Tabs */}
                <div className="flex gap-2">
                  {[
                    { id: "direct", label: "Direct URL" },
                    { id: "community", label: "Community Post 💬" },
                    { id: "markdown", label: "Markdown" },
                    { id: "html", label: "HTML Anchor" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setShareFormat(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        shareFormat === tab.id
                          ? "bg-sky-500 text-neutral-950"
                          : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Generated Snippet */}
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      readOnly
                      rows={4}
                      value={
                        shareFormat === "direct"
                          ? shareTargetFile.link
                          : shareFormat === "community"
                          ? `⚡ New resource uploaded: **${shareTargetFile.name}** (${formatBytes(shareTargetFile.size)})\nDirect Cloud Download: ${shareTargetFile.link}`
                          : shareFormat === "markdown"
                          ? `[Download ${shareTargetFile.name} (${formatBytes(shareTargetFile.size)})](${shareTargetFile.link})`
                          : `<a href="${shareTargetFile.link}" target="_blank" rel="noopener">Download ${shareTargetFile.name} (${formatBytes(shareTargetFile.size)})</a>`
                      }
                      className="w-full p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const content =
                          shareFormat === "direct"
                            ? shareTargetFile.link
                            : shareFormat === "community"
                            ? `⚡ New resource uploaded: **${shareTargetFile.name}** (${formatBytes(shareTargetFile.size)})\nDirect Cloud Download: ${shareTargetFile.link}`
                            : shareFormat === "markdown"
                            ? `[Download ${shareTargetFile.name} (${formatBytes(shareTargetFile.size)})](${shareTargetFile.link})`
                            : `<a href="${shareTargetFile.link}" target="_blank" rel="noopener">Download ${shareTargetFile.name} (${formatBytes(shareTargetFile.size)})</a>`;
                        handleCopy(content, "share-snippet");
                      }}
                      className="absolute right-3 bottom-3 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink === "share-snippet" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Snippet</span>
                    </button>
                  </div>
                </div>

                {/* Direct Action Link to Community */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-white">Post to NammaTech Community Hub</h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Open community hub to drop this file for all community members and guests.
                    </p>
                  </div>
                  <Link
                    href={`/admin/community`}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>Open Community</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: API KEY & SETTINGS ── */}
      {activeTab === "settings" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-sky-400" />
                <span>DUpload API Configuration</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configure your DUpload credentials. All changes are saved securely in your Supabase database settings.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  DUpload API Key (Required):
                </label>
                <input
                  type="text"
                  required
                  value={editApiKey}
                  onChange={(e) => setEditApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-sky-500"
                />
                <span className="text-[10px] text-neutral-500 block">
                  Find your API key at: dupload.net/?op=my_account
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  DUpload Account Username:
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  All Files Public URL:
                </label>
                <input
                  type="url"
                  value={editAllFilesUrl}
                  onChange={(e) => setEditAllFilesUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300">
                  Your Referral Link:
                </label>
                <input
                  type="url"
                  value={editReferralUrl}
                  onChange={(e) => setEditReferralUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              {settingsSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings updated and synced successfully!</span>
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={savingSettings || !editApiKey.trim()}
                  className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? "Saving Settings..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Single File Delete Confirmation Modal ── */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-white">Delete File?</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to delete this file from your DUpload storage?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1.5 text-xs">
              <div className="font-bold text-white truncate" title={fileToDelete.name}>
                {fileToDelete.name}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
                <span>Code: {fileToDelete.file_code}</span>
                <span>•</span>
                <span>Size: {formatBytes(fileToDelete.size)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 text-[11px] text-neutral-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>This file will be removed from your active library and moved to Trash.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={deletingFileCode !== null}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSingleFile}
                disabled={deletingFileCode !== null}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingFileCode ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirmation Modal ── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base font-bold text-white">Delete Selected Files?</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-white">{selectedFileCodes.length} selected files</strong>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 max-h-36 overflow-y-auto space-y-1 text-xs">
              {files.filter(f => selectedFileCodes.includes(f.file_code)).map(f => (
                <div key={f.file_code} className="flex items-center justify-between text-neutral-300 text-[11px]">
                  <span className="truncate max-w-[240px] font-medium">{f.name}</span>
                  <span className="font-mono text-neutral-500 shrink-0">{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-neutral-800/40 border border-neutral-700/50 text-[11px] text-neutral-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Selected files will be removed from your active library and moved to Trash.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 text-xs font-semibold text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting {selectedFileCodes.length} Files...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All {selectedFileCodes.length} Files</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Floating Toast Notification ── */}
      {actionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-2xl shadow-emerald-500/20 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
