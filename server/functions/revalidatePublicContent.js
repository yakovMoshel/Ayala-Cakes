import { revalidatePath } from 'next/cache';

/** Drop cached public pages and the sitemap after a catalog write. */
export function revalidatePublicContent(paths = []) {
  const targets = new Set(['/sitemap.xml', ...paths.filter(Boolean)]);
  for (const target of targets) {
    revalidatePath(target);
  }
}
