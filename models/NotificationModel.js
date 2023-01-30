const mongoose = require('mongoose');
const opts = {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

const NotificationSchema = new mongoose.Schema(
  {
    content: { type: String, require: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Posts' },
  },
  opts
);
// const ProductModel = mongoose.model("ProductModel", ProductSchema);
module.exports = mongoose.model('Notifications', NotificationSchema);
