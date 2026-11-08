import { supabase } from "@/lib/supabase";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const optimizeImage = async (file: File): Promise<Blob> => {
  if (typeof createImageBitmap === "undefined") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob || file), "image/webp", 0.86);
  });
};

export const adminProfileImageService = {
  upload: async (file: File): Promise<string> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error("Choose a JPG, PNG, or WebP image.");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("The profile image must be smaller than 5 MB.");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw new Error("Please sign in again to continue.");

    const image = await optimizeImage(file);
    const path = `${userData.user.id}/profile.webp`;
    const { error } = await supabase.storage
      .from("profile-images")
      .upload(path, image, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: true,
      });
    if (error) {
      if (error.message.toLowerCase().includes("bucket")) {
        throw new Error(
          "Profile-image storage is not installed yet. Run supabase_admin_profile_image_migration.sql in Supabase.",
        );
      }
      throw new Error(error.message);
    }

    const publicUrl = supabase.storage.from("profile-images").getPublicUrl(path).data.publicUrl;
    return `${publicUrl}?v=${Date.now()}`;
  },
};
