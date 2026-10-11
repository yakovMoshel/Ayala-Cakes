const mongoose = require('mongoose');

const AnalyticsViewEventSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['post', 'product'],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
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

AnalyticsViewEventSchema.index({ entityType: 1, viewedAt: 1 });
AnalyticsViewEventSchema.index({ entityType: 1, entityId: 1, viewedAt: 1 });

export const analyticsViewEventModel =
  mongoose.models.AnalyticsViewEvent ||
  mongoose.model('AnalyticsViewEvent', AnalyticsViewEventSchema);
