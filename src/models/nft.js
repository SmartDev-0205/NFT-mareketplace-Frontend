/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const NFTmetadata = new Schema({
    name: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    coverImage: {
        type: String,
        default: '',
    },
    image: {
        type: String,
        default: '',
    },
    external_url1: {
        type: String,
        default: '',
    },
    external_url2: {
        type: String,
        default: '',
    },
    external_url3: {
        type: String,
        default: '',
    },
    external_url4: {
        type: String,
        default: '',
    },
    external_url5: {
        type: String,
        default: '',
    },
    fee: {
        type: Number,
        default: 0,
    },
    fee_recipent: {
        type: String,
        default: '',
    },
});

const metadata = new Schema({
    image: {
        type: String,
        default: '',
    },
    external_url1: {
        type: String,
        default: '',
    },
    external_url2: {
        type: String,
        default: '',
    },
    external_url3: {
        type: String,
        default: '',
    },
    external_url4: {
        type: String,
        default: '',
    },
    external_url5: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    attributes: {
        type: Array,
    },
});

const marketdata = new Schema({
    acceptedToken: String,
    price: String,
    owner: String,
    startTime: String,
    endTime: String,
    bidder: String,
    bidPrice: String,
    prices: {
        type: Array,
    },
    tokens: {
        type: Array,
    },
    owners: {
        type: Array,
    },
    bidders: {
        type: Array,
    },
    bidPrices: {
        type: Array,
    },
    bidTokens: {
        type: Array,
    },
    bidTime: {
        type: Array,
    },
});

const item = new Schema({
    tokenID: { type: String },
    collectionAddress: String,
    likes: { type: Array },
    creator: String,
    owner: {
        type: String,
        required: true,
    },
    isOffchain: { type: Boolean, default: false },
    metadata: metadata,
    marketdata: marketdata,
});

const NFTs = new Schema({
    nft_id: {
        type: Schema.Types.ObjectId,
    },
    address: {
        type: String,
        default: '',
    },
    metadata: NFTmetadata,
    items: [item],
});

module.exports = NFT = mongoose.model('nfts', NFTs);
