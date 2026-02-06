// ============================================================
// Storage Service — Supabase Storage wrapper (isolated)
// ============================================================

import { createClient } from "@supabase/supabase-js";

const BUCKET = "catches";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function uploadCatchPhoto(
  userId: string,
  file: Buffer,
  filename: string,
  contentType: string
): Promise<{ path: string; publicUrl: string }> {
  const supabase = getAdminClient();
  const ext = filename.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

export async function deleteCatchPhoto(path: string): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Failed to delete photo:", error.message);
}
