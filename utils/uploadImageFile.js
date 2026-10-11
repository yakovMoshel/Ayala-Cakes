/** Upload one image through POST /api/upload. Returns { url, public_id }. */
export async function uploadImageFile(file, { filename = '', alt = '' } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (filename.trim()) formData.append('filename', filename.trim());
  if (alt.trim()) formData.append('alt', alt.trim());

  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Upload failed');
  }
  return data;
}
