import { productModel } from '@/server/DL/Models/productModel';
import { isCtaEnabled } from '@/utils/postCta';

export async function getPostCtaProducts(post, { includeInactive = false } = {}) {
  if (!post?.postCta || !isCtaEnabled(post.postCta)) {
    return [];
  }

  const ids = (post.postCta.productIds || []).slice(0, 2);
  if (!ids.length) return [];

  const query = { _id: { $in: ids } };
  if (!includeInactive) {
    query.isActive = true;
  }

  const products = await productModel
    .find(query)
    .select('name subtitle images slug price isActive')
    .lean();

  const orderMap = new Map(ids.map((id, index) => [String(id), index]));
  return products.sort(
    (a, b) => (orderMap.get(String(a._id)) ?? 0) - (orderMap.get(String(b._id)) ?? 0)
  );
}
