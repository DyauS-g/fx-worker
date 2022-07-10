const mongoose = require('mongoose');

const FxDataSchema = new mongoose.Schema({
  pair: {
    type: String,
  },
  bid: {
    type: String,
  },
  ask: {
    type: String,
  },
  high: {
    type: String,
  },
  low: {
    type: String,
  },
  change: {
    type: String,
  },
  changePrice: {
    type: String,
  },
  time: {
    type: String,
  },
});

const FxData = mongoose.model('FxData', FxDataSchema);
module.exports = FxData;
