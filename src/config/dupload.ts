/**
 * DUpload Configuration & Master Settings
 * Provides defaults for DUpload API integration (dupload.net).
 */

export interface DuploadSettings {
  apiKey: string;
  username: string;
  email: string;
  allFilesUrl: string;
  referralUrl: string;
  defaultFolderId?: string;
  accountType?: string;
}

export interface DuploadAccountInfo {
  email: string;
  balance: string;
  storage_used: number | null;
  storage_left: number;
  premium_expire: string;
}

export interface DuploadFileItem {
  file_code: string;
  name: string;
  size: string | number;
  uploaded: string;
  link: string;
  downloads: string | number;
  public: string | number;
  fld_id: string | number;
  thumbnail?: string | null;
}

export interface DuploadFolderItem {
  fld_id: string;
  name: string;
  code?: string | null;
}

export const DEFAULT_DUPLOAD_SETTINGS: DuploadSettings = {
  apiKey: process.env.DUPLOAD_API_KEY || "20830s6d9oldmav06o1ip",
  username: "muthuraj2004",
  email: "peralprince777@gmail.com",
  allFilesUrl: "https://dupload.net/users/muthuraj2004",
  referralUrl: "https://dupload.net/free20830.html",
  defaultFolderId: "2553",
  accountType: "FREE ACCOUNT",
};
