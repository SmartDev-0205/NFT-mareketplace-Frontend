/** @format */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserBasicSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
    },
    name: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    address: {
        type: String,
    },
    image: {
        type: String,
        default: ""
    },
    bannerImage: {
        type: String,
        default: ""
    },
    link1: {
        type: String,
        default: ""
    },
    link2: {
        type: String,
        default: ""
    },
    link3: {
        type: String,
        default: ""
    },
    link4: {
        type: String,
        default: ""
    }
});

module.exports = User = mongoose.model('users', UserBasicSchema);
