const NFT = require('../models/nft');
const Order = require("../models/order");
const { UserController, HistoryController } = require('../controllers');

const resolvers = {
    Query: {
        getCollectionNFTs: async (parent, args, context, info) => {
            try {
                const allNFTs = await NFT.find();

                return allNFTs;
            } catch (err) {
                console.log(err);
            }
        },
        getCollectionNFT: async (parent, args, context, info) => {
            try {
                const { address } = args;
                const allNFTs = await NFT.find({ address: address });

                return allNFTs;
            } catch (err) {
                console.log(err);
            }
        },
        getAllNFTs: async (parent, args, context, info) => {
            try {
                const allNFTs = await NFT.find();
                let nfts = [];
                allNFTs.map((item) => {
                    for (let i = 0; i < item.items.length; i++) {
                        nfts.push(item.items[i]);
                    }
                });
                return nfts;
            } catch (err) {
                console.log(err);
            }
        },
        getNFTs: async (parent, args, context, info) => {
            try {
                const { address } = args;
                const allNFTs = await NFT.find({ address: address });
                let nfts = [];
                allNFTs.map((item) => {
                    for (let i = 0; i < item.items.length; i++) {
                        nfts.push(item.items[i]);
                    }
                });

                return nfts;
            } catch (err) {
                console.log(err);
            }
        },
        getUsersInfo: async (parent, args, context, info) => {
            try {
                const allImages = await UserController.getUsersInfo();

                return allImages;
            } catch (err) {
                console.log(err);
            }
        },
        getPrice: async (parent, args, context, info) => {
            try {
            } catch (err) {
                console.log(err);
            }
        },
        getOrder: async (parent, args, context, info) => {
            try {
                const allOrder = await Order.find();

                return allOrder;
            } catch (err) {
                console.log(err);
            }
        },
        getActivity: async (parent, args, context, info) => {
            try {
                const allAcitivity = await HistoryController.finds({});

                return allAcitivity;
            } catch (err) {
                console.log(err);
            }
        }
    },
};

module.exports = { resolvers };
