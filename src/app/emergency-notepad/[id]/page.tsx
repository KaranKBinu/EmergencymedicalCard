"use client";

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  Cloud, 
  Upload, 
  RotateCw, 
  Copy, 
  Trash2, 
  Download, 
  Check, 
  FileText,
  AlertCircle,
  Paperclip,
  X,
  File,
  ExternalLink,
  Loader2,
  Share2,
  Plus,
  Hash,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

type SyncState = "synced" | "syncing" | "unsaved" | "error";

interface NoteAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function EmergencyNotepadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = use(params);
  const noteId = rawId || "default";
  const router = useRouter();

  const [content, setContent] = useState<string>("");
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncState>("synced");
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [customNoteId, setCustomNoteId] = useState<string>("");

  // Lock & Password state
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(false);
  const [storedPassword, setStoredPassword] = useState<string>("");
  const [unlockPasswordInput, setUnlockPasswordInput] = useState<string>("");
  const [showUnlockPassword, setShowUnlockPassword] = useState<boolean>(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Lock Modal state
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDone = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch note content from cloud storage for this noteId
  const loadNoteData = useCallback(async (providedPassword = "") => {
    try {
      setIsLoading(true);
      initialFetchDone.current = false;
      const url = `/api/emergency-notepad?noteId=${encodeURIComponent(noteId)}${
        providedPassword ? `&password=${encodeURIComponent(providedPassword)}` : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        setHasPassword(Boolean(data.hasPassword || data.isLocked));
        setIsLocked(Boolean(data.isLocked));

        if (data.isLocked && !providedPassword) {
          // Locked and no password provided yet
          setIsSessionUnlocked(false);
          setContent("");
          setAttachments([]);
        } else {
          // Unlocked successfully
          setIsSessionUnlocked(true);
          if (providedPassword) {
            setStoredPassword(providedPassword);
          }
          if (typeof data.content === "string") {
            setContent(data.content);
          }
          if (Array.isArray(data.attachments)) {
            setAttachments(data.attachments);
          }
        }

        if (data.updatedAt) {
          setLastSynced(new Date(data.updatedAt).toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error(`Failed to load cloud note for ${noteId}:`, err);
    } finally {
      setIsLoading(false);
      initialFetchDone.current = true;
    }
  }, [noteId]);

  useEffect(() => {
    loadNoteData();
  }, [loadNoteData]);

  // Save note, attachments & lock settings to cloud endpoint
  const performCloudSync = useCallback(
    async (
      textToSync: string,
      currentAttachments: NoteAttachment[],
      pwdToSync = storedPassword,
      lockState = isLocked
    ) => {
      setSyncStatus("syncing");
      try {
        const res = await fetch("/api/emergency-notepad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId,
            content: textToSync,
            attachments: currentAttachments,
            password: pwdToSync,
            isLocked: Boolean(lockState && pwdToSync),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSyncStatus("synced");
          setHasPassword(Boolean(data.hasPassword));
          setIsLocked(Boolean(data.isLocked));
          setLastSynced(new Date(data.updatedAt || Date.now()).toLocaleTimeString());
        } else {
          setSyncStatus("error");
        }
      } catch (err) {
        console.error("Cloud auto-sync error:", err);
        setSyncStatus("error");
      }
    },
    [noteId, storedPassword, isLocked]
  );

  // Trigger auto-sync with debounce
  const triggerAutoSync = (newContent: string, newAttachments: NoteAttachment[]) => {
    if (!initialFetchDone.current) return;
    setSyncStatus("unsaved");

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      performCloudSync(newContent, newAttachments);
    }, 700);
  };

  // Textarea change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    triggerAutoSync(newContent, attachments);
  };

  // Handle Unlock Form submission
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPasswordInput) return;

    setUnlockError(null);
    const toastId = toast.loading("Verifying password...");

    try {
      const res = await fetch(
        `/api/emergency-notepad?noteId=${encodeURIComponent(noteId)}&password=${encodeURIComponent(
          unlockPasswordInput
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.isLocked && !data.content && data.hasPassword) {
          setUnlockError("Incorrect password. Please try again.");
          toast.error("Incorrect password", { id: toastId });
        } else {
          setStoredPassword(unlockPasswordInput);
          setIsSessionUnlocked(true);
          setContent(data.content || "");
          setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
          setUnlockPasswordInput("");
          toast.success("Note Unlocked!", { id: toastId });
        }
      }
    } catch {
      setUnlockError("Verification failed. Please check connection.");
      toast.error("Unlock failed", { id: toastId });
    }
  };

  // Set / Change Password Modal Submission
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Password cannot be empty");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setStoredPassword(newPassword);
    setIsLocked(true);
    setHasPassword(true);
    setIsSessionUnlocked(true);
    setShowLockModal(false);

    performCloudSync(content, attachments, newPassword, true);
    toast.success("Password lock enabled!");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Remove Password Lock
  const handleRemoveLock = () => {
    if (confirm("Are you sure you want to remove the password lock from this note?")) {
      setStoredPassword("");
      setIsLocked(false);
      setHasPassword(false);
      setIsSessionUnlocked(true);
      setShowLockModal(false);

      performCloudSync(content, attachments, "", false);
      toast.success("Password lock removed!");
    }
  };

  // Lock Note Immediately (End Session)
  const handleLockNow = () => {
    setIsSessionUnlocked(false);
    setContent("");
    setAttachments([]);
    toast.success("Note locked!");
  };

  // Attach File Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading attachment to cloud...");

    try {
      const newAttachments: NoteAttachment[] = [...attachments];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("noteId", noteId);

        const res = await fetch("/api/emergency-notepad/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const uploadedFile: NoteAttachment = await res.json();
          newAttachments.push(uploadedFile);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setAttachments(newAttachments);
      triggerAutoSync(content, newAttachments);
      toast.success("Attachment uploaded & synced!", { id: toastId });
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("File upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove Attachment
  const handleRemoveAttachment = (idToRemove: string) => {
    const updatedAttachments = attachments.filter((att) => att.id !== idToRemove);
    setAttachments(updatedAttachments);
    triggerAutoSync(content, updatedAttachments);
    toast.success("Attachment removed!");
  };

  // Manual Sync
  const handleManualSync = () => {
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    performCloudSync(content, attachments);
    toast.success(`Note "${noteId}" synced to Cloud!`);
  };

  // Create random note
  const createNewRandomNote = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    router.push(`/emergency-notepad/${randomId}`);
    toast.success(`Created new notepad: ${randomId}`);
  };

  // Jump to custom note ID
  const handleJumpToNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNoteId.trim()) return;
    const cleanId = customNoteId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
    router.push(`/emergency-notepad/${cleanId}`);
    setCustomNoteId("");
  };

  const handleCopyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    toast.success("Page link copied! Share this link to access this note anywhere.");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    toast.success("Note content copied!");
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleClear = () => {
    if (confirm(`Are you sure you want to clear note "${noteId}"?`)) {
      setContent("");
      setAttachments([]);
      performCloudSync("", []);
      toast.success("Notepad cleared!");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `emergency-notepad-${noteId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded note file!");
  };

  const handleDownloadAttachment = (att: NoteAttachment) => {
    const link = document.createElement("a");
    link.href = att.url;
    link.download = att.name;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${att.name}...`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Metrics
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const lines = content ? content.split("\n").length : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[680px] transition-all relative">
        
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Emergency Note Pad
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-xs font-mono border border-blue-500/30 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {noteId}
                </span>
              </div>
              <p className="text-xs text-slate-400">Isolated Cloud Synced Notepad Page</p>
            </div>
          </div>

          {/* Sync & Lock Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sync Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700">
              {syncStatus === "synced" && (
                <>
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Cloud Synced</span>
                </>
              )}
              {syncStatus === "syncing" && (
                <>
                  <RotateCw className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-blue-400">Syncing...</span>
                </>
              )}
              {syncStatus === "unsaved" && (
                <>
                  <Upload className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-amber-400">Pending...</span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400">Error</span>
                </>
              )}
              {lastSynced && (
                <span className="text-slate-500 text-[11px] border-l border-slate-700 pl-2">
                  {lastSynced}
                </span>
              )}
            </div>

            {/* Lock / Password Management Button */}
            {hasPassword ? (
              <div className="flex items-center gap-1.5">
                {isSessionUnlocked && (
                  <button
                    onClick={handleLockNow}
                    title="Lock session now"
                    className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Now</span>
                  </button>
                )}
                <button
                  onClick={() => setShowLockModal(true)}
                  title="Password lock settings"
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Passkey</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLockModal(true)}
                title="Protect note with password"
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Lock Note</span>
              </button>
            )}

            {/* Share Link */}
            <button
              onClick={handleCopyLink}
              title="Copy link to this notepad"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-blue-400" />}
              <span>{copiedLink ? "Copied!" : "Share Link"}</span>
            </button>

            {/* New Note */}
            <button
              onClick={createNewRandomNote}
              title="Create a new private notepad"
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium text-xs rounded-xl border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {/* Manual Sync */}
            <button
              onClick={handleManualSync}
              disabled={syncStatus === "syncing" || (isLocked && !isSessionUnlocked)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-medium text-xs sm:text-sm rounded-xl shadow-md hover:shadow-blue-500/25 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Cloud className="w-4 h-4" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Note Navigation & Custom ID bar */}
        <div className="px-6 py-2.5 border-b border-slate-800/60 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Direct Access Link:</span>
            <code className="text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
              /emergency-notepad/{noteId}
            </code>
            {hasPassword && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[11px] font-medium flex items-center gap-1 border border-amber-500/30">
                <Lock className="w-3 h-3" /> Password Protected
              </span>
            )}
          </div>

          <form onSubmit={handleJumpToNote} className="flex items-center gap-2">
            <span className="text-slate-400">Jump to Page ID:</span>
            <input
              type="text"
              value={customNoteId}
              onChange={(e) => setCustomNoteId(e.target.value)}
              placeholder="e.g. secret123"
              className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs w-32"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer font-medium"
            >
              Go
            </button>
          </form>
        </div>

        {/* Note Content / Locked Screen Area */}
        <div className="relative flex-1 p-6 flex flex-col min-h-[360px]">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 min-h-[320px]">
              <RotateCw className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-sm">Fetching cloud note for `{noteId}`...</p>
            </div>
          ) : isLocked && !isSessionUnlocked ? (
            /* Locked Password Unlock Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col items-center space-y-5">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-400 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Note Password Protected</h2>
                  <p className="text-xs text-slate-400">
                    Enter the password for note <span className="text-blue-400 font-mono">#{noteId}</span> to view & edit.
                  </p>
                </div>

                <form onSubmit={handleUnlockSubmit} className="w-full space-y-4">
                  <div className="relative">
                    <input
                      type={showUnlockPassword ? "text" : "password"}
                      value={unlockPasswordInput}
                      onChange={(e) => {
                        setUnlockPasswordInput(e.target.value);
                        setUnlockError(null);
                      }}
                      placeholder="Enter password..."
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPassword(!showUnlockPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showUnlockPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {unlockError && (
                    <p className="text-xs text-rose-400 flex items-center justify-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {unlockError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-sm rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Note</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Unlocked Note Editor */
            <>
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder={`Type notes for page "${noteId}" here... Notes are isolated & auto-synced to this path.`}
                className="w-full flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base leading-relaxed resize-none focus:outline-none font-mono min-h-[280px]"
                autoFocus
              />

              {/* Attachments Section */}
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    Attached Files ({attachments.length})
                  </span>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/20 transition-all">
                    {isUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Paperclip className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? "Uploading..." : "Attach File"}</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {attachments.map((att) => {
                      const isImage = att.type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(att.name);
                      return (
                        <div
                          key={att.id}
                          className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/80 transition-all"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            {isImage ? (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-lg bg-slate-700/50 text-slate-300 shrink-0">
                                <File className="w-4 h-4" />
                              </div>
                            )}
                            <div className="truncate">
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-slate-200 hover:text-blue-400 truncate block transition-colors flex items-center gap-1"
                                title={att.name}
                              >
                                <span className="truncate">{att.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                              </a>
                              <span className="text-[10px] text-slate-500">
                                {formatFileSize(att.size)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleDownloadAttachment(att)}
                              className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-950/30 transition-colors cursor-pointer"
                              title="Download attachment"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="Remove attachment"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-1">
                    No files attached to this page yet. Click &quot;Attach File&quot; to upload files.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Metrics & Actions */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>{words} {words === 1 ? "word" : "words"}</span>
            <span>•</span>
            <span>{chars} {chars === 1 ? "char" : "chars"}</span>
            <span>•</span>
            <span>{lines} {lines === 1 ? "line" : "lines"}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              disabled={isLocked && !isSessionUnlocked}
              title="Copy text to clipboard"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer disabled:opacity-40"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              disabled={isLocked && !isSessionUnlocked}
              title="Download as .txt file"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer disabled:opacity-40"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              disabled={isLocked && !isSessionUnlocked}
              title="Clear notepad & attachments"
              className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 transition-all border border-slate-700/50 hover:border-rose-800/50 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Lock / Password Settings Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {hasPassword ? "Password Lock Settings" : "Set Password Lock"}
                </h3>
              </div>
              <button
                onClick={() => setShowLockModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {hasPassword ? "New Password" : "Set Password"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                {hasPassword && (
                  <button
                    type="button"
                    onClick={handleRemoveLock}
                    className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-medium text-xs rounded-xl border border-rose-800/50 transition-colors cursor-pointer"
                  >
                    Remove Lock
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowLockModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Save Password
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
