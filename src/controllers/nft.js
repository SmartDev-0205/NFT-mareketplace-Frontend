const NFT = require('../models/nft');
const fileAddresses = require('../contracts/contracts/addresses.json');

const nftControl = {
    update: async (props) => {
        const { id, collection, currentAddress } = props;

        var tokenIndex;
        if (collection !== fileAddresses.StoreFront) {
            tokenIndex = await NFT.aggregate([
                { $match: { address: collection } },
                {
                    $project: {
                        index: {
                            $indexOfArray: ['$items.tokenID', id],
                        },
                    },
                },
            ]);
        } else {
            tokenIndex = await NFT.aggregate([
                { $match: { address: collection } },
                {
                    $project: {
                        index: {
                            $indexOfArray: ['$items.tokenID', id],
                        },
                    },
                },
            ]);
        }
        let key = 'items.' + tokenIndex[0].index + '.likes';
        const itemCheck = await NFT.findOne({
            $and: [
                {
                    address: collection,
                },
                {
                    [key]: currentAddress,
                },
            ],
        });

        var result = null;
        if (itemCheck === null) {
            result = await NFT.updateOne(
                { address: collection },
                {
                    $push: {
                        [key]: currentAddress,
                    },
                }
            );
        } else {
            result = await NFT.updateOne(
                { address: collection },
                {
                    $pull: {
                        [key]: currentAddress,
                    },
                }
            );
        }

        return result;
    },
    findNFT: async (props) => {
        const { collectionAddress, id } = props;

        const item = await NFT.findOne({
            $and: [
                { address: collectionAddress },
                { items: { $elemMatch: { tokenID: id } } },
            ],
        });

        return item;
    },
    findCollection: async (props) => {
        const { collectionAddress } = props;

        const item = await NFT.findOne({
            address: collectionAddress,
        });

        return item;
    },
    createCollection: async (props) => {
        const {
            logoImage,
            bannerImage,
            collectionAddress,
            name,
            extUrl1,
            extUrl2,
            extUrl3,
            desc,
            fee,
            fee_recipent,
        } = props;

        const newCollection = new NFT({
            address: collectionAddress,
            metadata: {
                name: name,
                description: desc,
                coverImage: bannerImage,
                image: logoImage,
                external_url1: extUrl1,
                external_url2: extUrl2,
                external_url3: extUrl3,
                fee: fee,
                fee_recipent: fee_recipent,
            },
        });

        let collection = await newCollection.save();

        return collection;
    },
};

module.exports = { nftControl };
