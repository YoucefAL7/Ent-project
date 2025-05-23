const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
  code: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Shape', shapeSchema);
