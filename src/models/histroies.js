const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const HistorySchema = new Schema({
	event: {
		type: String,
		default: '',
	},
	contractAddress: {
		type: String,
		default: '',
	},
	tokenID: {
		type: String,
		default: '',
	},
	price: {
		type: String,
		default: '',
	},
	acceptedToken: {
		type: String,
		default: '',
	},
	timeStamp: {
		type: String,
		default: '',
	},
	userAddress: {
		type: String,
		default: '',
	}
});

module.exports = Histories = mongoose.model('histories', HistorySchema);