require('dotenv').config();
const {
	provider,
	getNFTContract,
	marketplaceContract,
	lazyNFTContract,
} = require('../contracts');
const { BlockNumController, manageNFTs, manageOrder, AddressController, HistoryController } = require('../controllers');
const { ethers } = require('ethers');
const axios = require('axios');
const { fromBigNum, toBigNum, getValidHttpUrl } = require('../utils');
const { handleEvent } = require('../utils/utils');
const contractAddresses = require('../contracts/contracts/addresses.json');

const nftHandler = async (tx, id) => {
	try {
		if (tx.event === 'Transfer') {
			let txData = {
				from: tx.args.from,
				to: tx.args.to,
				tokenId:
					id !== contractAddresses.StoreFront
						? fromBigNum(tx.args.tokenId, 0)
						: tx.args.tokenId,
			};
			// mint new nft
			if (txData.from === ethers.constants.AddressZero) {
				if (id !== contractAddresses.StoreFront) {
					const contract = getNFTContract(id);
					try {
						const tokenUri = getValidHttpUrl(await contract.tokenURI(
							txData.tokenId
						));
						console.log(
							tokenUri
						);

						var metadata = await axios.get(tokenUri);

						if (metadata.data.image) {
							metadata.data.image = getValidHttpUrl(metadata.data.image);
						}

						await manageNFTs.createNFT({
							tokenId: txData.tokenId,
							contractAddress: id,
							ownerAddress: txData.to,
							metadata: metadata.data,
						});
					} catch (err) {
						//default data
					}
					console.log('detect new NFT');
				}
			} else {
				await manageNFTs.updateOwner({
					contractAddress: id,
					tokenId: txData.tokenId,
					newAddress: txData.to,
				});
				console.log('detect NFT update - transfer');
			}
		}
	} catch (err) {
		console.log('handleTransation/nftHandler error:', err.message);
	}
}
const marketHandler = async (tx, id) => {
	try {
		// market events
		if (tx.event === 'OrderCreated') {
			let txData = {
				orderId: tx.args.id,
				seller: tx.args.seller,
				nftAddress: tx.args.nftAddress,
				assetId:
					id !== contractAddresses.StoreFront
						? fromBigNum(tx.args.assetId, 0)
						: tx.args.assetId,
				acceptedToken: tx.args.acceptedToken,
				price: fromBigNum(tx.args.priceInWei, 18),
				expiresAt: tx.args.expiresAt
			};
			console.log(
				'detect NFT update - market list',
				txData
			);
			await manageOrder.createOrder({
				orderId: txData.orderId,
				assetOwner: txData.seller,
				collectionAddress: txData.nftAddress,
				assetId: txData.assetId,
				price: txData.price,
				acceptedToken: txData.acceptedToken,
				expiresAt: txData.expiresAt
			});
			await HistoryController.create({
				event: "OrderCreated",
				contractAddress: txData.nftAddress,
				tokenID: txData.assetId,
				price: txData.price,
				acceptedToken: txData.acceptedToken,
				userAddress: txData.seller
			});
		}
		if (tx.event === 'OrderSuccessful') {
			let txData = {
				orderId: tx.args.id,
				buyer: tx.args.buyer,
				price: fromBigNum(tx.args.priceInWei, 18),
			};

			const order = await manageOrder.updateOrder({ orderId: txData.orderId, }, { status: "success" });
			await HistoryController.create({
				event: "OrderSuccessful",
				contractAddress: order?.contractAddress,
				tokenID: order?.assetId,
				price: order?.price,
				acceptedToken: order?.acceptedToken,
				userAddress: order?.assetOwner
			});
		}

		if (tx.event === 'OrderCancelled') {
			let txData = {
				orderId: tx.args.id
			};
			const order = await manageOrder.updateOrder({ orderId: txData.orderId, }, { status: "cancelled" })
			await HistoryController.create({
				event: "OrderCancelled",
				contractAddress: order.contractAddress,
				tokenID: order.assetId,
				price: "0",
				acceptedToken: order.acceptedToken,
				userAddress: order.assetOwner
			});
		}

		if (tx.event === 'BidCreated') {
			let txData = {
				collectionAddress: tx.args.nftAddress,
				assetId: String(tx.args.assetId),
				bidder: tx.args.bidder,
				price: fromBigNum(tx.args.priceInWei, 18),
				expiresAt: fromBigNum(tx.args.expiresAt, 0),
			};
			await manageOrder.placeBid({
				collectionAddress: txData.collectionAddress,
				assetId: txData.assetId,
				bidder: txData.bidder,
				price: txData.price,
				expiresAt: txData.expiresAt,
			})

			const order = await manageOrder.find({ contractAddress: txData.collectionAddress, assetId: txData.assetId })

			await HistoryController.create({
				event: "BidCreated",
				contractAddress: txData.collectionAddress,
				tokenID: txData.assetId,
				price: txData.price,
				acceptedToken: order?.acceptedToken,
				userAddress: txData.bidder
			});
		}
	} catch (err) {
		console.log('handleTransation/marketHandler error:', err.message);
	}
}
const handleTransation = async () => {
	try {
		const handler = async (tx, id) => {
			nftHandler(tx, id)
			marketHandler(tx, id)
		};

		const handleStart = async () => {
			/** Get NFT Addresses */
			const addresses = await AddressController.getAddresses({ id: 1 });
			const marketplace = await AddressController.getAddresses({ id: 2 });

			handleEvent({
				id: marketplace+"OrderCreated",
				provider: provider,
				contract: marketplaceContract,
				event: 'OrderCreated',
				times: 15,
				handler: handler,
				BlockNumController: BlockNumController,
			});

			handleEvent({
				id: marketplace+"OrderSuccessful",
				provider: provider,
				contract: marketplaceContract,
				event: 'OrderSuccessful',
				times: 15,
				handler: handler,
				BlockNumController: BlockNumController,
			})

			handleEvent({
				id: marketplace+"OrderCancelled",
				provider: provider,
				contract: marketplaceContract,
				event: 'OrderCancelled',
				times: 15,
				handler: handler,
				BlockNumController: BlockNumController,
			})

			handleEvent({
				id: marketplace+"BidCreated",
				provider: provider,
				contract: marketplaceContract,
				event: 'BidCreated',
				times: 15,
				handler: handler,
				BlockNumController: BlockNumController,
			})

			for (let i = 0; i < addresses.length; i++) {
				handleEvent({
					id: addresses[i],
					provider: provider,
					contract:
						addresses[i] !== contractAddresses.StoreFront
							? getNFTContract(addresses[i])
							: lazyNFTContract,
					event: 'Transfer',
					times: 15,
					handler: handler,
					BlockNumController: BlockNumController,
				});
			}
		};

		handleStart();
	} catch (err) {
		console.log(err);
	}
};

module.exports = { handleTransation, nftHandler };
