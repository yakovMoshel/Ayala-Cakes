const mongoose = require('mongoose');

const PageViewEventSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  visitorId: {
    type: String,
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

PageViewEventSchema.index({ viewedAt: 1 });
PageViewEventSchema.index({ path: 1, viewedAt: 1 });

export const pageViewEventModel =
  mongoose.models.PageViewEvent || mongoose.model('PageViewEvent', PageViewEventSchema);
