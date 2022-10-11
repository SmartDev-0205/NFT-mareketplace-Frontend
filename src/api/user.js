const { ethers } = require('ethers');
const { UserController } = require('../controllers');
// const jwtEncode = require('jwt-encode');
const jwt = require('jsonwebtoken');
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI(process.env.IPFS_HOST, process.env.IPFS_PORT, {
    protocol: process.env.IPFS_OPT,
});

module.exports = {
    updateInfo: async (req, res) => {
        try {
            const { name, bio, email, link1, link2, signature } = req.body;

            const userAddress = ethers.utils.verifyMessage(
                name,
                signature
            );

            if (req.files?.image !== null && req.files?.image !== undefined) { 
                var [logoResult] = await ipfs.files.add(req.files.image.data);
            }
            if (req.files?.bannerImage !== null && req.files?.bannerImage !== undefined) {
                var [bannerResult] = await ipfs.files.add(
                    req.files.bannerImage.data
                );
            }

            let newData = {
                address: userAddress,
                name: name || "",
                bio: bio || "",
                email: email || "",
                link1: link1 || "",
                link2: link2 || "",
            }
            if (!!logoResult) newData['image'] = process.env.IPFS_BASEURL_1 + logoResult.hash;
            if (!!bannerResult) newData['bannerImage'] = process.env.IPFS_BASEURL_1 + bannerResult.hash;

            let user = await UserController.update(newData);

            var data = {
                name: user.name,
                email: user.email,
                bio: user.bio,
                image: user.image,
                bannerImage: user.bannerImage,
                link1: user.link1,
                link2: user.link2,
                link3: user.link3,
                link4: user.link4,
            };
            res.json({ status: true, data: data });
        } catch (err) {
            console.log(err);
            res.json({
                success: false,
                msg: 'server error',
            });
        }
    },
    Create: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const wallet = new ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            console.log(wallet.address);
            await UserController.create({
                name: name,
                email: email,
                password: password,
                address: wallet.address,
                privateKey: privateKey,
            });

            res.json({ status: true });
        } catch (err) {
            res.json({ status: false, error: err.message });
        }
    },
    logIn: async (req, res) => {
        try {
            const { address } = req.body;
            let user = await UserController.checkInfo({
                filter: { address: address }
            });
            if (!user) user = { name: "user", email: "unknown", bio: "unknown", address: address }

            res.json({ status: true, data: user });
        } catch (err) {
            console.log(err.message);
            res.json({ status: false });
        }
    },

    middleware: (req, res, next) => {
        try {
            const token = req.headers.authorization || '';
            jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
                console.log('Error: ', err);
                if (err) return res.sendStatus(403);
                const user = await UserController.checkInfo({
                    filter: {
                        name: userData.name,
                    },
                });

                if (!user) return res.sendStatus(403);
                req.user = user;
                next();
            });
        } catch (err) {
            if (err) return res.sendStatus(403);
        }
    },
    adminMiddleware: (req, res, next) => {
        try {
            const token = req.headers.authorization || '';
            jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
                console.log('Error: ', err);
                if (err) return res.sendStatus(403);
                const user = await UserController.checkInfo({
                    filter: {
                        name: userData.name,
                    },
                });
                if (!user.isAdmin) return res.sendStatus(403);
                req.user = user;
                next();
            });
        } catch (err) {
            if (err) return res.sendStatus(403);
        }
    },
};
