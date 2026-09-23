"use client";
import { createClient } from "@/lib/supabase/client";

// Uploads into the signed-in user's own folder ({user_id}/{invite_id}/...), which is what
// the storage policies allow. Returns the public URL.
// Scales a photo down to at most 2000px on the long side and re-encodes it as JPEG, so an invitation
// loads fast on a phone. Falls back to the original if the browser cannot decode it.
async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export async function uploadFile(bucket: "photos" | "music", inviteId: string, original: File): Promise<string> {
  const file = bucket === "photos" ? await shrink(original) : original;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in again.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${inviteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message);
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Documents live in a private bucket at {invite_id}/..., readable by anyone who can manage
// that event (owner or accepted team member), not just the uploader. Returns the storage path;
// callers need a signed URL (see signedDocumentUrl) to actually view or download it.
export async function uploadDocument(inviteId: string, file: File): Promise<{ path: string; name: string }> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${inviteId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("documents").upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message);
  return { path, name: file.name };
}

export async function signedDocumentUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
  if (error || !data) throw new Error(error?.message || "Could not open that file.");
  return data.signedUrl;
}

export type LibraryTrack = { name: string; url: string };

// Royalty-free tracks you upload to music/library/ in the Supabase dashboard.
export async function listLibrary(): Promise<LibraryTrack[]> {
  const supabase = createClient();
  const { data } = await supabase.storage.from("music").list("library", { limit: 200, sortBy: { column: "name", order: "asc" } });
  return (data ?? [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => ({
      name: f.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "),
      url: supabase.storage.from("music").getPublicUrl(`library/${f.name}`).data.publicUrl,
    }));
}
