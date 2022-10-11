require('dotenv').config();
const ipfsAPI = require('ipfs-api');
const bs58 = require('bs58');
const ipfs = ipfsAPI(process.env.IPFS_HOST, process.env.IPFS_PORT, {
    protocol: process.env.IPFS_OPT,
});
const {
    nftControl,
    manageNFTs,
    BlockNumController,
    AddressController,
} = require('../controllers');
const {
    contractDeploy,
    provider,
    getNFTContract,
    contractGas,
} = require('../contracts');
const { sign, getAdmin, toBigNum, handleEvent } = require('../utils/utils');
const addresses = require('../contracts/contracts/addresses.json');
const { nftHandler } = require('../blockchainApis/handleEvent');
const { syncNFTItems, verifyContract } = require("../blockchainApis/handlerSync");

module.exports = {
    MintNFT: async (req, res) => {
        try {
            const {
                name,
                extlink1,
                extlink2,
                extlink3,
                extlink4,
                extlink5,
                desc,
                attribute,
            } = req.body;
            ipfs.files.add(req.files.image.data, function (err, file) {
                if (err || file === undefined) {
                    throw new Error('ipfs error');
                }
                let imageUrl = file[0].hash;

                let attr = [];
                let attrJSON = JSON.parse(attribute);
                for (let x in attrJSON) {
                    if (
                        attrJSON[x].key.trim() !== '' &&
                        attrJSON[x].value.trim() !== ''
                    ) {
                        attr.push(attrJSON[x]);
                    } else {
                        break;
                    }
                }

                const metadata = {
                    image: process.env.IPFS_BASEURL_1 + imageUrl,
                    external_url1: extlink1,
                    external_url2: extlink2,
                    external_url3: extlink3,
                    external_url4: extlink4,
                    external_url5: extlink5,
                    description: desc,
                    name: name,
                    attributes: attr,
                };

                let bufferfile = Buffer.from(JSON.stringify(metadata));

                ipfs.files.add(bufferfile, function (err, file) {
                    if (err || file === undefined) {
                        throw new Error('ipfs error');
                    }
                    let nftUrl = file[0].hash;
                    res.json({
                        success: true,
                        url: nftUrl,
                    });
                });
            });
        } catch (err) {
            console.log(err.message);
            return res.json({
                success: false,
            });
        }
    },
    LikeNFT: async (req, res) => {
        try {
            const { tokenId, collectAddress, currentAddress } = req.body;

            const result = await nftControl.update({
                id: tokenId,
                collection: collectAddress,
                currentAddress: currentAddress,
            });

            console.log(result);

            if (result) {
                res.json({
                    success: true,
                });
            } else {
                res.json({
                    success: false,
                    msg: 'database error',
                });
            }
        } catch (err) {
            console.log(err.message);
            return res.json({
                success: false,
                msg: 'server error',
            });
        }
    },
    LazyMint: async (req, res) => {
        try {
            const {
                name,
                extlink1,
                extlink2,
                desc,
                attribute,
            } = req.body;
            ipfs.files.add(req.files.image.data, function (err, file) {
                if (err || file === undefined) {
                    throw new Error('ipfs error');
                }
                let imageUrl = file[0].hash;

                let attr = [];
                let attrJSON = JSON.parse(attribute);
                for (let x in attrJSON) {
                    if (
                        attrJSON[x].key.trim() !== '' &&
                        attrJSON[x].value.trim() !== ''
                    ) {
                        attr.push(attrJSON[x]);
                    } else {
                        break;
                    }
                }

                const metadata = {
                    image: process.env.IPFS_BASEURL_1 + imageUrl,
                    external_url1: extlink1,
                    external_url2: extlink2,
                    description: desc,
                    name: name,
                    attributes: attr,
                };

                let bufferfile = Buffer.from(JSON.stringify(metadata));
                ipfs.files.add(bufferfile, async (err, file) => {
                    if (err || file === undefined) {
                        throw new Error('ipfs error');
                    }
                    const bytes = bs58.decode(file[0].hash);
                    const hex = Buffer.from(bytes).toString('hex');
                    tokenId = '0x' + hex.slice(4);

                    let result = await manageNFTs.createNFT({
                        contractAddress: addresses.StoreFront,
                        ownerAddress: req.user.address,
                        metadata: metadata,
                        tokenId: tokenId,
                        isOffchain: true,
                    });

                    if (result) {
                        res.json({
                            success: true,
                        });
                    } else {
                        res.json({
                            success: false,
                            msg: 'processing error',
                        });
                    }
                });
            });
        } catch (err) {
            console.log(err.message);
            return res.json({
                success: false,
                msg: 'server error',
            });
        }
    },
    LazyOnSale: async (req, res) => {
        try {
            const { nftAddress, assetId, priceGwei, expiresAt } = req.body;

            const correctNFT = await nftControl.findNFT({
                collectionAddress: nftAddress,
                id: assetId,
            });

            if (correctNFT.items[0].owner !== req.user.address) {
                throw new Error('nft owner invalid');
            }

            const signer = await getAdmin();

            var onSaleData = {
                tokenId: assetId,
                owner: req.user.address,
                market: addresses.Marketplace,
                _priceInWei: priceGwei,
                _expiresAt: toBigNum(expiresAt, 0),
                signer: signer,
            };
            var signature = await sign(onSaleData);

            res.json({
                success: true,
                result: signature,
            });
        } catch (err) {
            console.log(err);
            return res.json({
                success: false,
                msg: 'server error',
            });
        }
    },
    CreateCollection: async (req, res) => {
        const { name, extUrl1, extUrl2, extUrl3, extUrl4, extUrl5, desc, address } = req.body;
        const isValid = await verifyContract(address);
        if (!isValid) return res.json({
            success: false,
            msg: 'invalid contract address',
        });
        try {
            let [logoResult] = await ipfs.files.add(req.files.logoImage.data);
            let [bannerResult] = await ipfs.files.add(
                req.files.bannerImage.data
            );

            var logoImage = process.env.IPFS_BASEURL_1 + logoResult.hash;
            var bannerImage = process.env.IPFS_BASEURL_1 + bannerResult.hash;

            const check = await nftControl.findCollection({
                collectionAddress: address,
            });

            if (check) {
                return res.json({
                    success: false,
                    msg: 'contract already exist',
                });
            }

            await AddressController.create({ newAddress: address });

            const result = await nftControl.createCollection({
                bannerImage: bannerImage,
                logoImage: logoImage,
                collectionAddress: address,
                name: name,
                extUrl1: extUrl1,
                extUrl2: extUrl2,
                extUrl3: extUrl3,
                extUrl4: extUrl4,
                extUrl5: extUrl5,
                desc: desc,
                fee: 0
            });

            if (result) {
                res.json({
                    success: true,
                });

                await syncNFTItems(address);

                handleEvent({
                    id: address,
                    provider: provider,
                    contract: getNFTContract(address),
                    event: 'Transfer',
                    times: 15,
                    handler: nftHandler,
                    BlockNumController: BlockNumController,
                });
                console.log('create new handle process');
            }
        } catch (err) {
            console.log(err);
            res.json({
                success: false,
                msg: 'server error',
            });
        }
    },
    GetCollectionGas: async (req, res) => {
        try {
            var gas = await contractGas({
                privateKey: req.user.privateKey,
                name: req.user.name,
            });

            res.json({
                success: true,
                gas: gas,
            });
        } catch (err) {
            console.log(err.message);
            res.json({
                success: false,
            });
        }
    },
    verifyContract: async (req, res) => {
        try {
            const { address } = req.body;
            res.json({
                success: await verifyContract(address)
            });
        } catch (err) {
            console.log(err.message);
            res.json({
                success: false,
            });
        }
    }
};
