const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  focusKeyword: {
    type: String,
    required: false
  },
  secondaryKeywords: [{
    type: String,
    required: false
  }],
  seoTitle: {
    type: String,
    required: false
  },
  metaDescription: {
    type: String,
    required: false
  },
  callToAction: {
    type: String,
    required: false
  },
  socialImage: {
    type: String,
    required: false
  },
  altText: {
    type: String,
    required: false
  },
  imageTitle: {
    type: String,
    required: false
  },
  structuredData: {
    type: Object,
    required: false
  },
  breadcrumbs: [{
    name: String,
    url: String
  }],
  tags: [{
    type: String,
    required: false
  }],
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // TODO: ADD FAQ fields when needed in the future
  canonicalUrl: {
    type: String,
    required: false
  },
  ogImage: {
    type: String,
    required: false
  },
  twitterCard: {
    type: String,
    enum: ['summary', 'summary_large_image', 'app', 'player'],
    default: 'summary_large_image'
  },
  readingTime: {
    type: Number,
    required: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  }
});

export const postModel = mongoose.models.Post || mongoose.model('Post', PostSchema);