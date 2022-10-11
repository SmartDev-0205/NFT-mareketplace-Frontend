require('dotenv').config();
const { ethers } = require('ethers');

const supportChainId = process.env.CHAINID || 250;

const RPCS = {
    // 1: "http://13.59.118.124/eth",
    250: "https://rpc.ftm.tools/",
    // 4002: "https://ftm-test.babylonswap.finance",
    // 4: 'http://85.206.160.196',
    // 1337: "http://localhost:7545",
    // 31337: "http://localhost:8545/",
};

const providers = {
    // 1: new ethers.providers.JsonRpcProvider(RPCS[1]),
    // 4: new ethers.providers.JsonRpcProvider(RPCS[4]),
    250: new ethers.providers.JsonRpcProvider(RPCS[250]),
    // 4002: new ethers.providers.JsonRpcProvider(RPCS[4002]),
    // 1337: new ethers.providers.JsonRpcProvider(RPCS[1337]),
    // 31337: new ethers.providers.JsonRpcProvider(RPCS[31337]),
};

const provider = providers[supportChainId];

module.exports = { supportChainId, provider };
