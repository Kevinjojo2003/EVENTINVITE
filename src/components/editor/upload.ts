"use client";
import { createClient } from "@/lib/supabase/client";

// Uploads into the signed-in user's own folder ({user_id}/{invite_id}/...), which is what
// the storage policies allow. Returns the public URL.
export async function uploadFile(bucket: "photos" | "music", inviteId: string, file: File): Promise<string> {
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
