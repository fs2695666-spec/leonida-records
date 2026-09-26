'use client';
import { browserClient } from '@/lib/supabase/browser';
import { registerMedia } from '@/app/admin/_actions/library';

export const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,video/mp4,video/webm';
export const MAX_BYTES = 15 * 1024 * 1024;

function safeName(name) {
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file';
  const ext = (dot > 0 ? name.slice(dot + 1) : '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5);
  return ext ? `${base}.${ext}` : base;
}

function dimensions(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url); };
      img.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
      img.src = url;
    } else if (file.type.startsWith('video/')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => { resolve({ width: v.videoWidth, height: v.videoHeight }); URL.revokeObjectURL(url); };
      v.onerror = () => { resolve({}); URL.revokeObjectURL(url); };
      v.src = url;
    } else resolve({});
  });
}

/**
 * Upload files straight from the browser to Supabase Storage (bucket "media"),
 * then register them in the media table through a server action.
 * Direct upload avoids Vercel's request-size limit. Storage RLS only lets staff write.
 */
export async function uploadFiles(files, { onProgress, credit = '' } = {}) {
  const supabase = browserClient();
  if (!supabase) throw new Error('Supabase no está configurado');
  const list = Array.from(files);
  const rows = [];
  const errors = [];
  let done = 0;
  for (const file of list) {
    if (!ACCEPT.split(',').includes(file.type)) { errors.push(`${file.name}: formato no permitido`); continue; }
    if (file.size > MAX_BYTES) { errors.push(`${file.name}: supera 15 MB`); continue; }
    const now = new Date();
    const path = `uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID().slice(0, 8)}-${safeName(file.name)}`;
    const [{ error }, dims] = await Promise.all([
      supabase.storage.from('media').upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false }),
      dimensions(file),
    ]);
    if (error) { errors.push(`${file.name}: ${error.message}`); continue; }
    const { data } = supabase.storage.from('media').getPublicUrl(path);
    rows.push({
      storage_path: path, url: data.publicUrl, kind: file.type.startsWith('video/') ? 'video' : 'image',
      mime_type: file.type, size_bytes: file.size, width: dims.width || null, height: dims.height || null,
      alt_text: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), caption: '', credit,
    });
    done += 1;
    onProgress?.(done, list.length);
  }
  let saved = [];
  if (rows.length) {
    const res = await registerMedia(rows);
    if (!res.ok) {
      await supabase.storage.from('media').remove(rows.map((r) => r.storage_path));
      throw new Error(res.error);
    }
    saved = res.data;
  }
  return { saved, errors };
}
