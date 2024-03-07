const mongoose = require('mongoose');

const itemHistorySchema = new mongoose.Schema({
  itemID: {
    type: String,
    trim: true,
  },
  boardID: {
    type: String,
    trim: true,
  },
  groupID: {
    type: String,
    trim: true,
  },
  itemName: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    trim: true,
  },
  statusIndex: {
    type: Number,
  },
  email: {
    type: String,
    trim: true,
  },
  numbers: {
    type: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted_by: {
    type: mongoose.Schema.ObjectId,
    default: null,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('ItemHistory', itemHistorySchema);