const { AddressController } = require('./addresses');
const { manageNFTs, manageOrder } = require('./blockchain');
const { BlockNumController } = require('./blocknum');
const { nftControl } = require('./nft');
const { UserController } = require('./users');
const { AdminController } = require('./admin');
const { HistoryController } = require("./histories")

module.exports = {
  AdminController,
  AddressController,
  manageNFTs,
  manageOrder,
  BlockNumController,
  nftControl,
  UserController,
  HistoryController
};
