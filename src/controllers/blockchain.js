require('dotenv').config();
const colors = require('colors');
const NFT = require('../models/nft');
const Order = require("../models/order")
const fileAddresses = require('../contracts/contracts/addresses.json');
const { AddressController } = require('./addresses');
const { fromBigNum } = require('../utils/utils');

const manageNFTs = {
  createNFT: async (props) => {
    try {
      const {
        contractAddress,
        ownerAddress,
        creatorAddress,
        metadata,
        tokenId,
        isOffchain,
      } = props;

      const item = {
        tokenID: tokenId,
        collectionAddress: contractAddress,
        owner: ownerAddress,
        creator: creatorAddress ? creatorAddress : ownerAddress,
        metadata: metadata,
        isOffchain: isOffchain ? isOffchain : false,
        marketdata: {
          price: '',
          owner: '',
          startTime: '',
          endTime: '',
          bidder: '',
          bidPrice: '',
          prices: [],
          owners: [],
          bidders: [],
          bidPrices: [],
          bidTime: [],
        },
      };
      const result = await NFT.updateOne(
        { address: contractAddress },
        {
          $push: {
            items: item,
          },
        }
      );

      if (!result) {
        throw new Error('Database Error');
      }

      return result;
    } catch (err) {
      console.log(colors.red(err));
    }
  },
  updateAllNFTs: async (props) => {
    try {
      // const { dataArray, ownerArray, creatorArray, totalSupplyArray } =
      //     props;

      /** Format MongoDatabase */
      // await NFT.remove();

      /** Get NFT Addresses */
      const addresses = await AddressController.getAddresses({ id: 1 });
      // NFT Skeleton ADD
      for (let i = 0; i < addresses.length; i++) {
        const checking = await NFT.find({ address: addresses[i] });

        if (!checking[0]) {
          const defaultData = new NFT({
            address: addresses[i],
            metadata: {
              name: 'test',
              description: 'test default NFT collection',
              coverImage:
                'https://res.cloudinary.com/galaxy-digital/image/upload/v1653351729/marketplace/Background_8_egry4i.jpg',
              image: 'https://res.cloudinary.com/galaxy-digital/image/upload/v1652371143/icicbmetaverse/jatehwm95eitsdj87hhb.png',
              external_url1: '',
              external_url2: '',
              external_url3: '',
              fee: '0.2',
              fee_recipent: process.env.OWNER,
            },
          });
          const saveData = await defaultData.save();

          if (!saveData) {
            throw new Error('Database Error');
          }
        }
      }

      console.log(colors.green('Sync all nfts data...'));
    } catch (err) {
      console.log(colors.red(err));
    }
  },
  updateOwner: async (props) => {
    try {
      const { contractAddress, tokenId, newAddress } = props;

      var result = null;
      const data = await NFT.find({ address: contractAddress });

      if (contractAddress !== fileAddresses.StoreFront) {
        var tokenIndex;
        data[0].items.find((item, index) => {
          if (item.tokenID == tokenId) {
            tokenIndex = index;
            return true;
          } else return false;
        });
        
        let key = 'items.' + tokenIndex + '.owner';
        let offchain = 'items.' + tokenIndex + '.isOffchain';

        result = await NFT.updateOne(
          { address: contractAddress },
          {
            $set: {
              [key]: newAddress,
              [offchain]: false,
            }
          }
        );
      } else {
        let nftIndex = await NFT.aggregate([
          { $match: { address: contractAddress } },
          {
            $project: {
              index: {
                $indexOfArray: ['$items.tokenID', tokenId._hex],
              },
            },
          },
        ]);

        let itemData = data[0].items[nftIndex[0].index];

        let key = 'items.' + nftIndex[0].index + '.owner';
        let price = 'items.' + nftIndex[0].index + '.marketdata.price';
        let preowner =
          'items.' + nftIndex[0].index + '.marketdata.owner';
        let time = 'items.' + nftIndex[0].index + '.marketdata.endTime';
        let bidder =
          'items.' + nftIndex[0].index + '.marketdata.bidder';
        let bidPrice =
          'items.' + nftIndex[0].index + '.marketdata.bidPrice';
        let bidders =
          'items.' + nftIndex[0].index + '.marketdata.bidders';
        let bidPrices =
          'items.' + nftIndex[0].index + '.marketdata.bidPrices';
        let offchain = 'items.' + nftIndex[0].index + '.isOffchain';

        let owners =
          'items.' + nftIndex[0].index + '.marketdata.owners';
        let prices =
          'items.' + nftIndex[0].index + '.marketdata.prices';

        result = await NFT.updateOne(
          { address: contractAddress },
          {
            $set: {
              [key]: newAddress,
              [price]: '',
              [preowner]: '',
              [time]: '',
              [bidder]: '',
              [bidPrice]: '',
              [bidders]: [],
              [bidPrices]: [],
              [offchain]: false,
            },
            $push: {
              [owners]: itemData?.marketdata.owner,
              [prices]: itemData?.marketdata.price,
            },
          }
        );
      }

      if (!result) {
        throw new Error('Database Error');
      }

      return result;
    } catch (err) {
      console.log(colors.red(err));
    }
  },
  checkNFTAddress: async (props) => {
    try {
      const { address } = props;

      const result = await NFT.findOne({ address: address });

      if (result) return true;
      else return false;
    } catch (err) {
      console.log(colors.red(err));
    }
  },
  removeItems: async (props) => {
    const { contractAddress } = props;
    return await NFT.updateOne(
      { address: contractAddress },
      {
        $set: {
          items: [],
        },
      }
    );
  }
};

const manageOrder = {
  createOrder: async (props) => {
    try {
      const {
        orderId,
        assetOwner,
        collectionAddress,
        assetId,
        price,
        acceptedToken,
        expiresAt,
      } = props;

      var result = null;

      if (collectionAddress !== fileAddresses.StoreFront) {
        let nftIndex = await NFT.aggregate([
          { $match: { address: collectionAddress } },
          {
            $project: {
              index: {
                $indexOfArray: ['$items.tokenID', assetId],
              },
            },
          },
        ]);

        let key1 = 'items.' + nftIndex[0].index + '.marketdata.price';
        let key2 =
          'items.' + nftIndex[0].index + '.marketdata.acceptedToken';
        let key3 = 'items.' + nftIndex[0].index + '.marketdata.owner';
        let key4 = 'items.' + nftIndex[0].index + '.marketdata.endTime';
        let key5 = 'items.' + nftIndex[0].index + '.isOffchain';
        result = await NFT.updateOne(
          { address: collectionAddress },
          {
            $set: {
              [key1]: price,
              [key2]: acceptedToken,
              [key3]: assetOwner,
              [key4]: expiresAt,
              [key5]: false,
            },
          }
        );
      } else {
        let nftIndex = await NFT.aggregate([
          { $match: { address: collectionAddress } },
          {
            $project: {
              index: {
                $indexOfArray: ['$items.tokenID', assetId._hex],
              },
            },
          },
        ]);

        let key1 = 'items.' + nftIndex[0].index + '.marketdata.price';
        let key2 =
          'items.' + nftIndex[0].index + '.marketdata.acceptedToken';
        let key3 = 'items.' + nftIndex[0].index + '.marketdata.owner';
        let key4 = 'items.' + nftIndex[0].index + '.marketdata.endTime';
        let key5 = 'items.' + nftIndex[0].index + '.isOffchain';

        result = await NFT.updateOne(
          { address: collectionAddress },
          {
            $set: {
              [key1]: price,
              [key2]: acceptedToken,
              [key3]: assetOwner,
              [key4]: expiresAt,
              [key5]: false,
            },
          }
        );
      }

      await Order.deleteOne({ orderId: orderId });
      var newOrder = new Order({
        "orderId": orderId,
        "contractAddress": collectionAddress,
        "assetId": assetId,
        "price": price,
        "acceptedToken": acceptedToken,
        "assetOwner": assetOwner,
        "status": "pending"
      });
      await newOrder.save();

      if (!result) {
        throw new Error('Database Error');
      }

      return result;
    } catch (err) {
      console.log(colors.red(err));
    }
  },
  placeBid: async (props) => {
    const { collectionAddress, assetId, bidder, price, expiresAt } = props;

    var result = null;
    if (collectionAddress !== fileAddresses.StoreFront) {
      let nftIndex = await NFT.aggregate([
        { $match: { address: collectionAddress } },
        {
          $project: {
            index: {
              $indexOfArray: ['$items.tokenID', assetId],
            },
          },
        },
      ]);

      console.log('Props ======== ', props);
      console.log('index -------- ', nftIndex[0].index);

      let key = 'items.' + nftIndex[0].index + '.marketdata.bidder';
      let key1 = 'items.' + nftIndex[0].index + '.marketdata.bidPrice';
      let key2 = 'items.' + nftIndex[0].index + '.marketdata.bidders';
      let key3 = 'items.' + nftIndex[0].index + '.marketdata.bidPrices';
      let key4 = 'items.' + nftIndex[0].index + '.marketdata.bidTime';
      let key5 = 'items.' + nftIndex[0].index + '.isOffchain';

      result = await NFT.updateOne(
        { address: collectionAddress },
        {
          $set: {
            [key]: bidder,
            [key1]: price,
            [key5]: false,
          },
          $push: {
            [key2]: bidder,
            [key3]: price,
            [key4]: expiresAt,
          },
        }
      );
    } else {
      let nftIndex = await NFT.aggregate([
        { $match: { address: collectionAddress } },
        {
          $project: {
            index: {
              $indexOfArray: ['$items.tokenID', assetId._hex],
            },
          },
        },
      ]);

      let key = 'items.' + nftIndex[0].index + '.marketdata.bidder';
      let key1 = 'items.' + nftIndex[0].index + '.marketdata.bidPrice';
      let key2 = 'items.' + nftIndex[0].index + '.marketdata.bidders';
      let key3 = 'items.' + nftIndex[0].index + '.marketdata.bidPrices';
      let key4 = 'items.' + nftIndex[0].index + '.marketdata.bidTime';
      let key5 = 'items.' + nftIndex[0].index + '.isOffchain';

      result = await NFT.updateOne(
        { address: collectionAddress },
        {
          $set: {
            [key]: bidder,
            [key1]: price,
            [key5]: false,
          },
          $push: {
            [key2]: bidder,
            [key3]: price,
            [key4]: expiresAt,
          },
        }
      );
    }

    if (!result) {
      throw new Error('Database Error');
    }

    return result;
  },
  updateOrder: async (filter, data) => {
    try {
      await Order.updateOne(filter, data);
      return await Order.findOne(filter);
    } catch (err) {
      console.log(err);
    }
  },
  finds: async (filter) => {
    return await Order.find(filter);
  },
  find: async (filter) => {
    return await Order.updateOne(filter);
  },
};

module.exports = {
  manageNFTs,
  manageOrder,
};
