const mongoose = require('mongoose');

const ProductViewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
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

ProductViewSchema.index({ productId: 1, visitorId: 1 }, { unique: true });

export const productViewModel =
  mongoose.models.ProductView || mongoose.model('ProductView', ProductViewSchema);
