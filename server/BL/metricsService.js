import { postModel } from '../DL/Models/postModel';
import { postViewModel } from '../DL/Models/postViewModel';
import { productModel } from '../DL/Models/productModel';
import { productViewModel } from '../DL/Models/productViewModel';
import { analyticsViewEventModel } from '../DL/Models/analyticsViewEventModel';
import { pageViewEventModel } from '../DL/Models/pageViewEventModel';
import { resolveMetricsRange } from '../../utils/metricsRange';
import { STATIC_PAGES, titleForPublicPath } from '../../utils/publicPages';

function eventMatch(entityType, start, end) {
  const match = { entityType };
  if (start || end) {
    match.viewedAt = {};
    if (start) match.viewedAt.$gte = start;
    if (end) match.viewedAt.$lt = end;
  }
  return match;
}

function timeBound(start, end) {
  const bound = {};
  if (start) bound.$gte = start;
  if (end) bound.$lt = end;
  return bound;
}

function isInRange(date, start, end) {
  if (!date) return false;
  const time = new Date(date).getTime();
  if (Number.isNaN(time)) return false;
  if (start && time < start.getTime()) return false;
  if (end && time >= end.getTime()) return false;
  return true;
}

/** Visits saved before dated events: one view, or two when the first and last visit differ. */
function historicalViewCount(visit, start, end) {
  const firstIn = isInRange(visit.firstViewedAt, start, end);
  const lastIn = isInRange(visit.lastViewedAt, start, end);
  if (!firstIn && !lastIn) return 0;
  if (!firstIn || !lastIn) return 1;
  const first = new Date(visit.firstViewedAt).getTime();
  const last = new Date(visit.lastViewedAt).getTime();
  return first === last ? 1 : 2;
}

async function periodStats(entityType, viewModel, idField, start, end) {
  const eventsMatch = eventMatch(entityType, start, end);
  const historyMatch = {
    $or: [
      { firstViewedAt: timeBound(start, end) },
      { lastViewedAt: timeBound(start, end) },
    ],
  };

  const [eventRows, historyRows, eventVisitors, historyVisitors] = await Promise.all([
    analyticsViewEventModel.aggregate([
      { $match: eventsMatch },
      {
        $group: {
          _id: '$entityId',
          views: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
        },
      },
    ]),
    viewModel.aggregate([
      { $match: historyMatch },
      {
        $group: {
          _id: `$${idField}`,
          visitors: {
            $push: {
              visitorId: '$visitorId',
              firstViewedAt: '$firstViewedAt',
              lastViewedAt: '$lastViewedAt',
            },
          },
        },
      },
    ]),
    analyticsViewEventModel.distinct('visitorId', eventsMatch),
    viewModel.distinct('visitorId', historyMatch),
  ]);

  const byEntity = new Map();
  eventRows.forEach((row) => {
    byEntity.set(String(row._id), {
      views: row.views,
      visitors: new Set(row.visitors),
      eventVisitors: new Set(row.visitors),
    });
  });
  historyRows.forEach((row) => {
    const key = String(row._id);
    const current = byEntity.get(key) || { views: 0, visitors: new Set(), eventVisitors: new Set() };
    row.visitors.forEach((visit) => {
      current.visitors.add(visit.visitorId);
      if (!current.eventVisitors.has(visit.visitorId)) {
        current.views += historicalViewCount(visit, start, end);
      }
    });
    byEntity.set(key, current);
  });

  return {
    byEntity: new Map(
      [...byEntity].map(([key, value]) => [
        key,
        { views: value.views, uniqueVisitors: value.visitors.size },
      ])
    ),
    totalUniqueVisitors: new Set([...eventVisitors, ...historyVisitors]).size,
    useStoredViews: false,
  };
}

async function allTimeStats(viewModel, idField) {
  const grouped = await viewModel.aggregate([
    { $group: { _id: `$${idField}`, uniqueVisitors: { $sum: 1 } } },
  ]);
  const uniqueVisitors = await viewModel.distinct('visitorId');
  return {
    byEntity: new Map(
      grouped.map((row) => [
        String(row._id),
        { uniqueVisitors: row.uniqueVisitors },
      ])
    ),
    totalUniqueVisitors: uniqueVisitors.length,
    useStoredViews: true,
  };
}

function toItems(docs, stats, mapDoc) {
  return docs
    .map((doc) => {
      const row = stats.byEntity.get(String(doc._id));
      const mapped = mapDoc(doc);
      return {
        ...mapped,
        views: stats.useStoredViews ? (doc.views ?? 0) : (row?.views ?? 0),
        uniqueVisitors: row?.uniqueVisitors ?? 0,
        createdAt: doc.createdAt,
      };
    })
    .sort((a, b) => b.views - a.views || b.uniqueVisitors - a.uniqueVisitors);
}

export async function recordContentView({ entityType, entityId, visitorId, viewedAt = new Date() }) {
  await analyticsViewEventModel.create({
    entityType,
    entityId,
    visitorId,
    viewedAt,
  });
}

export async function recordPageView({ path, visitorId, viewedAt = new Date() }) {
  await pageViewEventModel.create({ path, visitorId, viewedAt });
}

function pageEventMatch(start, end) {
  if (!start && !end) return {};
  const viewedAt = {};
  if (start) viewedAt.$gte = start;
  if (end) viewedAt.$lt = end;
  return { viewedAt };
}

async function contentVisitorIds(start, end) {
  const match = start || end
    ? {
        $or: [
          { firstViewedAt: timeBound(start, end) },
          { lastViewedAt: timeBound(start, end) },
        ],
      }
    : {};

  const [postVisitors, productVisitors] = await Promise.all([
    postViewModel.distinct('visitorId', match),
    productViewModel.distinct('visitorId', match),
  ]);

  return { postVisitors, productVisitors };
}

async function pageStats(start, end, posts, products) {
  const match = pageEventMatch(start, end);
  const [rows, pageVisitors, contentVisitors] = await Promise.all([
    pageViewEventModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$path',
          views: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' },
        },
      },
    ]),
    pageViewEventModel.distinct('visitorId', match),
    contentVisitorIds(start, end),
  ]);

  const byPath = new Map(
    rows.map((row) => [
      row._id,
      { views: row.views, uniqueVisitors: row.visitors.length },
    ])
  );

  const paths = new Set([
    ...STATIC_PAGES.map((page) => page.path),
    ...byPath.keys(),
  ]);

  const staticOrder = new Map(STATIC_PAGES.map((page, index) => [page.path, index]));
  const items = [...paths]
    .map((path) => {
      const row = byPath.get(path);
      return {
        path,
        title: titleForPublicPath(path, { posts, products }),
        views: row?.views ?? 0,
        uniqueVisitors: row?.uniqueVisitors ?? 0,
      };
    })
    .sort((a, b) => {
      if (b.views !== a.views) return b.views - a.views;
      if (b.uniqueVisitors !== a.uniqueVisitors) return b.uniqueVisitors - a.uniqueVisitors;
      const aOrder = staticOrder.has(a.path) ? staticOrder.get(a.path) : 1000;
      const bOrder = staticOrder.has(b.path) ? staticOrder.get(b.path) : 1000;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title, 'he');
    });

  const siteVisitors = new Set([
    ...pageVisitors,
    ...contentVisitors.postVisitors,
    ...contentVisitors.productVisitors,
  ]);

  return {
    items,
    totalViews: items.reduce((sum, item) => sum + item.views, 0),
    totalUniqueVisitors: pageVisitors.length,
    siteVisitors: siteVisitors.size,
  };
}

export async function getAdminMetrics(rangeId) {
  const range = resolveMetricsRange(rangeId);
  if (!range) {
    const error = new Error('INVALID_RANGE');
    error.code = 'INVALID_RANGE';
    throw error;
  }

  const [posts, products] = await Promise.all([
    postModel
      .find({ status: { $ne: 'deleted' } })
      .select('title slug views status createdAt')
      .lean(),
    productModel.find().select('name slug views isActive createdAt').lean(),
  ]);

  const [postStats, productStats, pages] = range.id === 'all'
    ? await Promise.all([
        allTimeStats(postViewModel, 'postId'),
        allTimeStats(productViewModel, 'productId'),
        pageStats(null, null, posts, products),
      ])
    : await Promise.all([
        periodStats('post', postViewModel, 'postId', range.start, range.end),
        periodStats('product', productViewModel, 'productId', range.start, range.end),
        pageStats(range.start, range.end, posts, products),
      ]);

  const postItems = toItems(posts, postStats, (post) => ({
    _id: post._id,
    title: post.title,
    slug: post.slug,
    status: post.status,
  }));

  const productItems = toItems(products, productStats, (product) => ({
    _id: product._id,
    title: product.name,
    slug: product.slug,
    status: product.isActive ? 'active' : 'inactive',
  }));

  const postTotalViews = postItems.reduce((sum, item) => sum + item.views, 0);
  const productTotalViews = productItems.reduce((sum, item) => sum + item.views, 0);

  return {
    range: {
      id: range.id,
      start: range.start,
      end: range.end,
    },
    posts: {
      summary: {
        totalViews: postTotalViews,
        totalUniqueVisitors: postStats.totalUniqueVisitors,
        publishedCount: postItems.filter((item) => item.status === 'published').length,
        itemCount: postItems.length,
      },
      items: postItems,
    },
    products: {
      summary: {
        totalViews: productTotalViews,
        totalUniqueVisitors: productStats.totalUniqueVisitors,
        activeCount: productItems.filter((item) => item.status === 'active').length,
        itemCount: productItems.length,
      },
      items: productItems,
    },
    pages: {
      summary: {
        totalViews: pages.totalViews,
        totalUniqueVisitors: pages.totalUniqueVisitors,
        itemCount: pages.items.length,
      },
      items: pages.items,
    },
    site: {
      visitors: pages.siteVisitors,
      pageViews: pages.totalViews,
    },
  };
}
