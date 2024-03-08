const mongoose = require('mongoose');

const itemHistorySchema = new mongoose.Schema({
  boardID: {
    type: String,
    trim: true,
  },
  groupID: {
    type: String,
    trim: true,
  },
  itemID: {
    type: String,
    trim: true,
  },
  action_status:{
    type:String,
    enum : ['New Item','Removed',"Updated"],
    default: 'Updated',
  },
  update_column:{
    type:String,
    trim: true,
  },
  update_value:{
    type:String,
    trim: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model('ItemHistoryModel', itemHistorySchema);