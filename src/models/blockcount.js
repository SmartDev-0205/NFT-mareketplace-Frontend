const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const BlockCountSchema = new Schema({
    id: {
        type: String,
    },
    latestBlock: {
        type: Number,
    },
});

module.exports = BLOCKNUM = mongoose.model('blocknumber', BlockCountSchema);
