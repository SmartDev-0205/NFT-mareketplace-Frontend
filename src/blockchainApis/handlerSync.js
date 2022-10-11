require('dotenv').config();
const axios = require("axios");
const { BlockNumController } = require('../controllers/blocknum');
const colors = require('colors');

const {
  getNFTContract_m,
  getNFTContract,
  provider,
  multicallHelper,
  marketplaceContract_m,
} = require('../contracts');
const { manageNFTs, manageOrder } = require('../controllers/blockchain');
const { AddressController } = require('../controllers/addresses');
const { getValidHttpUrl } = require('../utils');
const { fromBigNum } = require("../utils");

const handleSync = async () => {
  try {
    /** Get NFT Addresses */

    await manageNFTs.updateAllNFTs();
    if (process.env.SYNCMODE == "true") {
      console.log(colors.green('Sync nft items...'));
      const addresses = await AddressController.getAddresses({ id: 1 });
      for (const address of addresses) {
        await syncNFTItems(address);
      }
      // Update Block Number
      let currentBlockNumber = await provider.getBlockNumber();
      for (let i = 0; i < addresses.length; i++) {
        await BlockNumController.update({
          id: addresses[i],
          latestBlock: currentBlockNumber,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const syncNFTItems = async (address) => {
  try {
    await manageNFTs.removeItems({ contractAddress: address });
    // manageNFTs.createNFT
    const NFTContract = getNFTContract(address);

    const totalSupply = await NFTContract.totalSupply();
    const NFTContract_m = getNFTContract_m(address);

    // get all token Ids
    let multiCalls = [];
    for (let i = 0; i < Number(totalSupply); i++) {
      multiCalls.push(NFTContract_m.tokenByIndex(String(i)));
    }
    const tokenIds = await multicallHelper(multiCalls);

    // get token uris
    multiCalls = tokenIds.map((tokenId) => {
      return NFTContract_m.tokenURI(tokenId);
    });
    const tokenUris = await multicallHelper(multiCalls);

    // get token owners
    multiCalls = tokenIds.map((tokenId) => {
      return NFTContract_m.ownerOf(tokenId);
    });
    const owners = await multicallHelper(multiCalls);

    //get token creators
    let creators = [...owners];
    multiCalls = tokenIds.map((tokenId) => {
      return NFTContract_m.creatorOf(tokenId);
    });
    try {
      creators = await multicallHelper(multiCalls);
    } catch (err) {
      // console.log("handleSync/creatorOf", err.message);
    }

    // market datas
    var tokenIdsOnMarket = [];
    const marketAddress = await AddressController.getAddresses({
      id: 2,
    });

    try {

      // get token uri
      for (let index = 0; index < tokenIds.length; index++) {
        const tokenUri = getValidHttpUrl(tokenUris[index]);
        console.log("tokenUri", tokenUri);
        let metadata;
        try{
          metadata = await axios.get(tokenUri);
        } catch (err) {
          continue;
        }
        if(metadata.data.image) {
            metadata.data.image = getValidHttpUrl(metadata.data.image);
        }
        
        await manageNFTs.createNFT({
          tokenId: tokenIds[index],
          contractAddress: address,
          ownerAddress: owners[index],
          creatorAddress: creators[index],
          metadata: metadata.data,
        });

        //NFT in market
        if ((owners[index]).toUpperCase() == marketAddress.toUpperCase()) {
          tokenIdsOnMarket.push(tokenIds[index]);
        }
      }

      //get marketdata
      multiCalls = tokenIdsOnMarket.map((tokenId) => {
        return marketplaceContract_m.orderByAssetId(address, tokenId);
      });

      const marketdatas = await multicallHelper(multiCalls);

      for (let index = 0; index < tokenIdsOnMarket.length; index++) {
        await manageOrder.createOrder({
          orderId: marketdatas[index].id,
          assetOwner: marketdatas[index].seller,
          collectionAddress: marketdatas[index].nftAddress,
          assetId: String(tokenIdsOnMarket[index]),
          price: fromBigNum(marketdatas[index].price),
          acceptedToken: marketdatas[index].acceptedToken,
          expiresAt: marketdatas[index].expiresAt,
          marketAddress: marketAddress,
        });
      }
    } catch (err) {
      console.log(
        'blockchainapis/handlesync/syncNFTItems/tokenUri :',
        err.message
      );
    }

  } catch (err) {
    console.log('blockchainapis/handlesync/syncNFTItems :', err.message);
  }
};

const verifyContract = async (address) => {
  try {
    const NFTContract = getNFTContract(address);
    const isValid = await NFTContract.supportsInterface("0x780e9d63");
    return isValid;
  } catch (err) {
    return false;
  }
}
module.exports = { handleSync, syncNFTItems, verifyContract };
