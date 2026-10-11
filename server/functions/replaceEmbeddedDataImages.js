import { getOptimizedCloudinaryUrl } from '@/utils/cloudinaryUrl';
import { buildCloudinaryContext } from '@/utils/cloudinaryContext';
import { uploadImageBuffer } from '@/server/functions/uploadImageBuffer.mjs';

function extractDataUrls(html) {
  const urls = [];
  let from = 0;

  while (from < html.length) {
    const start = html.indexOf('data:image/', from);
    if (start === -1) break;

    const quote = html[start - 1];
    if (quote === '"' || quote === "'") {
      const end = html.indexOf(quote, start);
      if (end === -1) break;
      urls.push(html.slice(start, end));
      from = end + 1;
      continue;
    }

    const headerEnd = html.indexOf(';base64,', start);
    if (headerEnd === -1 || headerEnd - start > 80) {
      from = start + 'data:image/'.length;
      continue;
    }

    let end = headerEnd + ';base64,'.length;
    while (end < html.length && /[A-Za-z0-9+/=]/.test(html[end])) end += 1;
    urls.push(html.slice(start, end));
    from = end;
  }

  return [...new Set(urls)];
}

function altForDataUrl(html, dataUrl) {
  const index = html.indexOf(dataUrl);
  const imgStart = html.lastIndexOf('<img', index);
  const imgEnd = html.indexOf('>', index);
  if (imgStart === -1 || imgEnd === -1 || imgStart > index) return '';

  const beforeSrc = html.slice(imgStart, index);
  const afterSrc = html.slice(index + dataUrl.length, imgEnd);
  const tagEdges = `${beforeSrc} ${afterSrc}`;
  const match = tagEdges.match(/\balt\s*=\s*"([^"]*)"/i) || tagEdges.match(/\balt\s*=\s*'([^']*)'/i);
  return match?.[1] || '';
}

function bufferFromDataUrl(dataUrl) {
  const comma = dataUrl.indexOf(',');
  if (comma === -1 || !dataUrl.slice(0, comma).includes(';base64')) return null;
  const buffer = Buffer.from(dataUrl.slice(comma + 1).replace(/\s/g, ''), 'base64');
  return buffer.length ? buffer : null;
}

/** Replace embedded data:image sources with hosted blog image URLs. */
export async function replaceEmbeddedDataImages(html) {
  if (!html || !html.includes('data:image/')) return html;

  const dataUrls = extractDataUrls(html);
  if (!dataUrls.length) {
    console.error('Embedded image upload failed: unrecognized data URL');
    throw new Error('Failed to upload embedded image');
  }

  let next = html;
  for (const dataUrl of dataUrls) {
    const buffer = bufferFromDataUrl(dataUrl);
    if (!buffer) {
      console.error('Embedded image upload failed: invalid data URL');
      throw new Error('Failed to upload embedded image');
    }

    let result;
    try {
      result = await uploadImageBuffer(buffer, {
        context: buildCloudinaryContext(altForDataUrl(next, dataUrl)),
      });
    } catch (error) {
      console.error('Embedded image upload failed:', error);
      throw new Error('Failed to upload embedded image');
    }

    if (!result?.secure_url) {
      console.error('Embedded image upload failed: missing secure_url');
      throw new Error('Failed to upload embedded image');
    }

    next = next.split(dataUrl).join(getOptimizedCloudinaryUrl(result.secure_url, 800));
  }

  return next;
}
