const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);