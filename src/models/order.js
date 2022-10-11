const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const OrderSchema = new Schema({
    orderId: {
        type: String,
    },
    contractAddress: {
        type: String,
    },
    assetId: {
        type: String,
    },
    price: {
        type: String,
    },
    acceptedToken: {
        type: String,
    },
    assetOwner: {
        type: String,
    },
    status: {
        type: String,
    }
});

module.exports = Order = mongoose.model('orders', OrderSchema);
