import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_DUPLOAD_SETTINGS, DuploadSettings } from "@/config/dupload";

// Helper to verify admin identity (via designated email or DB profile role)
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, user: null };

  const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isDesignatedAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));
  if (isDesignatedAdmin) return { authorized: true, user };

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminByRole = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
  return { authorized: isAdminByRole, user };
}

// Retrieve saved DUpload settings from site_settings or fallback to defaults
async function getDuploadSettings(): Promise<DuploadSettings> {
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "dupload_settings")
      .maybeSingle();

    if (data?.value) {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      return { ...DEFAULT_DUPLOAD_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error("Error reading dupload_settings from DB:", err);
  }
  return DEFAULT_DUPLOAD_SETTINGS;
}

export async function GET(request: NextRequest) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "overview";
  const settings = await getDuploadSettings();
  const apiKey = settings.apiKey || DEFAULT_DUPLOAD_SETTINGS.apiKey;

  try {
    if (action === "overview") {
      // Fetch Account Info, Folders, and Recent Files in parallel
      const [accRes, foldersRes, filesRes] = await Promise.allSettled([
        fetch(`https://dupload.net/api/account/info?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" }),
        fetch(`https://dupload.net/api/folder/list?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" }),
        fetch(`https://dupload.net/api/file/list?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" }),
      ]);

      let account = null;
      if (accRes.status === "fulfilled" && accRes.value.ok) {
        const accJson = await accRes.value.json();
        if (accJson.status === 200) account = accJson.result;
      }

      let folders = [];
      if (foldersRes.status === "fulfilled" && foldersRes.value.ok) {
        const fldJson = await foldersRes.value.json();
        if (fldJson.status === 200 && fldJson.result?.folders) {
          folders = fldJson.result.folders;
        }
      }

      let files = [];
      let totalFiles = 0;
      if (filesRes.status === "fulfilled" && filesRes.value.ok) {
        const filesJson = await filesRes.value.json();
        if (filesJson.status === 200 && filesJson.result?.files) {
          files = filesJson.result.files;
          totalFiles = Number(filesJson.result.results_total || files.length);
        }
      }

      return NextResponse.json({
        success: true,
        settings,
        account,
        folders,
        files,
        totalFiles,
      });
    }

    if (action === "files") {
      const fldId = searchParams.get("fld_id") || "";
      const page = searchParams.get("page") || "1";
      const url = new URL("https://dupload.net/api/file/list");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("page", page);
      if (fldId && fldId !== "all") {
        url.searchParams.set("fld_id", fldId);
      }

      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "folders") {
      const res = await fetch(`https://dupload.net/api/folder/list?key=${encodeURIComponent(apiKey)}`, { cache: "no-store" });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "upload_server") {
      const serverRes = await fetch(`https://dupload.net/api/upload/server?key=${encodeURIComponent(apiKey)}`, {
        cache: "no-store",
      });
      const serverData = await serverRes.json();
      if (serverData.status === 200 && serverData.result && serverData.sess_id) {
        return NextResponse.json({
          success: true,
          upload_url: serverData.result,
          sess_id: serverData.sess_id,
        });
      }
      return NextResponse.json({ error: serverData.msg || "Failed to obtain upload server" }, { status: 502 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("DUpload API GET error:", err);
    return NextResponse.json({ error: err.message || "Failed to communicate with DUpload API" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "";
  const settings = await getDuploadSettings();
  const apiKey = settings.apiKey || DEFAULT_DUPLOAD_SETTINGS.apiKey;

  try {
    // 1. Direct Multipart File Upload to DUpload Server
    if (action === "upload_file") {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const targetFolder = (formData.get("fld_id") as string) || settings.defaultFolderId || "";

      if (!file) {
        return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
      }

      // Step A: Request Upload Server & Session ID from DUpload API
      const serverRes = await fetch(`https://dupload.net/api/upload/server?key=${encodeURIComponent(apiKey)}`, {
        cache: "no-store",
      });
      const serverData = await serverRes.json();

      if (serverData.status !== 200 || !serverData.result || !serverData.sess_id) {
        return NextResponse.json(
          { error: serverData.msg || "Failed to obtain DUpload upload server session" },
          { status: 502 }
        );
      }

      const uploadUrl = serverData.result;
      const sessId = serverData.sess_id;

      // Step B: Send file to upload.cgi with utype: 'reg'
      const outgoingForm = new FormData();
      outgoingForm.append("sess_id", sessId);
      outgoingForm.append("utype", "reg");
      if (targetFolder) {
        outgoingForm.append("fld_id", targetFolder);
      }
      outgoingForm.append("file_0", file, file.name);

      const upRes = await fetch(uploadUrl, {
        method: "POST",
        body: outgoingForm,
      });

      const responseText = await upRes.text();
      let uploadResult: Array<{ file_code: string; file_status: string }> = [];

      try {
        uploadResult = JSON.parse(responseText);
      } catch {
        return NextResponse.json(
          { error: `DUpload server response: ${responseText.slice(0, 300)}` },
          { status: 500 }
        );
      }

      if (!Array.isArray(uploadResult) || uploadResult.length === 0 || !uploadResult[0].file_code) {
        return NextResponse.json(
          { error: "Upload failed on DUpload server", raw: uploadResult },
          { status: 500 }
        );
      }

      const fileCode = uploadResult[0].file_code;
      const downloadLink = `https://dupload.net/${fileCode}`;

      // Step C: If targetFolder is specified, ensure file is moved into it
      if (targetFolder) {
        try {
          await fetch(
            `https://dupload.net/api/file/set_folder?key=${encodeURIComponent(apiKey)}&file_code=${encodeURIComponent(fileCode)}&fld_id=${encodeURIComponent(targetFolder)}`
          );
        } catch (fldErr) {
          console.warn("Failed to set folder after upload:", fldErr);
        }
      }

      return NextResponse.json({
        success: true,
        file_code: fileCode,
        link: downloadLink,
        name: file.name,
        size: file.size,
        fld_id: targetFolder,
      });
    }

    // 2. Remote URL Upload
    if (action === "remote_upload") {
      const body = await request.json();
      const urls: string[] = Array.isArray(body.urls) ? body.urls : [body.url].filter(Boolean);
      const targetFolder = body.fld_id || settings.defaultFolderId || "";

      if (urls.length === 0) {
        return NextResponse.json({ error: "Please enter at least one URL" }, { status: 400 });
      }

      const results = [];
      for (const rawUrl of urls.slice(0, 20)) {
        const trimmed = rawUrl.trim();
        if (!trimmed) continue;

        try {
          let apiUrl = `https://dupload.net/api/upload/url?key=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(trimmed)}`;
          if (targetFolder) {
            apiUrl += `&folder=${encodeURIComponent(targetFolder)}`;
          }

          const res = await fetch(apiUrl, { cache: "no-store" });
          const json = await res.json();

          if (json.status === 200 && json.result?.filecode) {
            results.push({
              url: trimmed,
              success: true,
              file_code: json.result.filecode,
              link: `https://dupload.net/${json.result.filecode}`,
            });
          } else {
            results.push({
              url: trimmed,
              success: false,
              error: json.msg || "Remote leech queue failed",
            });
          }
        } catch (e: any) {
          results.push({
            url: trimmed,
            success: false,
            error: e.message || "Network error",
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
      });
    }

    // 3. Create Folder
    if (action === "create_folder") {
      const { name } = await request.json();
      if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
      }

      const res = await fetch(
        `https://dupload.net/api/folder/create?key=${encodeURIComponent(apiKey)}&name=${encodeURIComponent(name.trim())}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (json.status === 200 && json.result?.fld_id) {
        return NextResponse.json({
          success: true,
          fld_id: json.result.fld_id,
          name: name.trim(),
        });
      }

      return NextResponse.json({ error: json.msg || "Failed to create folder" }, { status: 400 });
    }

    // 4. Move File to Folder
    if (action === "move_file") {
      const { file_code, fld_id } = await request.json();
      if (!file_code) {
        return NextResponse.json({ error: "file_code is required" }, { status: 400 });
      }

      const res = await fetch(
        `https://dupload.net/api/file/set_folder?key=${encodeURIComponent(apiKey)}&file_code=${encodeURIComponent(file_code)}&fld_id=${encodeURIComponent(fld_id || "0")}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (json.status === 200) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: json.msg || "Failed to move file" }, { status: 400 });
    }

    // 5. Save DUpload Settings
    if (action === "save_settings") {
      const newSettings = await request.json();
      const updated: DuploadSettings = {
        apiKey: newSettings.apiKey?.trim() || DEFAULT_DUPLOAD_SETTINGS.apiKey,
        username: newSettings.username?.trim() || DEFAULT_DUPLOAD_SETTINGS.username,
        email: newSettings.email?.trim() || DEFAULT_DUPLOAD_SETTINGS.email,
        allFilesUrl: newSettings.allFilesUrl?.trim() || DEFAULT_DUPLOAD_SETTINGS.allFilesUrl,
        referralUrl: newSettings.referralUrl?.trim() || DEFAULT_DUPLOAD_SETTINGS.referralUrl,
        defaultFolderId: newSettings.defaultFolderId || "",
        accountType: newSettings.accountType || "FREE ACCOUNT",
      };

      const supabaseAdmin = createAdminClient();
      const { error } = await supabaseAdmin.from("site_settings").upsert(
        {
          key: "dupload_settings",
          value: JSON.stringify(updated),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, settings: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("DUpload API POST error:", err);
    return NextResponse.json({ error: err.message || "Failed processing request" }, { status: 500 });
  }
}
