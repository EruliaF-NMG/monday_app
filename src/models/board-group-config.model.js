const mongoose = require('mongoose');

const groupRefSchema = new mongoose.Schema({
  groupID: {
    type: String,
    trim: true,
  },
  isDuplicate: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const bordConfig = new mongoose.Schema({
  boardID: {
    type: String,
    trim: true,
  },
  groupRef: [groupRefSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('BordConfigModel', bordConfig);