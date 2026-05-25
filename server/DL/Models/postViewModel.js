const mongoose = require('mongoose');

const PostViewSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  visitorId: {
    type: String,
    required: true,
  },
  firstViewedAt: {
    type: Date,
    default: Date.now,
  },
  lastViewedAt: {
    type: Date,
    default: Date.now,
  },
});

PostViewSchema.index({ postId: 1, visitorId: 1 }, { unique: true });

export const postViewModel =
  mongoose.models.PostView || mongoose.model('PostView', PostViewSchema);
