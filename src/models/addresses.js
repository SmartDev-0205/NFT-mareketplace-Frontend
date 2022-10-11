const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const AddressesSchema = new Schema({
    nfts: {
        type: Array,
    },
    marketplace: {
        type: String,
    },
});

module.exports = ADDRESSES = mongoose.model('addresses', AddressesSchema);
