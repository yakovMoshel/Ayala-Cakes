const mongoose = require('mongoose');

const postCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const postCategoryModel =
  mongoose.models.PostCategory || mongoose.model('PostCategory', postCategorySchema);
