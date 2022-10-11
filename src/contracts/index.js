require('dotenv').config();
const { ethers } = require('ethers');
const Bytecode = require('./contracts/bytecode.json');
const Abis = require('./contracts/abis.json');
const Addresses = require('./contracts/addresses.json');
const { provider, supportChainId } = require('./providers');
const { Contract, Provider, setMulticallAddress } = require('ethers-multicall');

const multicallAddress = process.env.MULTIADDRESS;
setMulticallAddress(250, "0xaeF5373b058DceacedF2995005A86aDfE860c4B4");

const lazyNFTContract = new ethers.Contract(
  Addresses.StoreFront,
  Abis.StoreFront,
  provider
);
const marketplaceContract = new ethers.Contract(
  Addresses.Marketplace,
  Abis.Marketplace,
  provider
);
const marketplaceContract_m = new Contract(
  Addresses.Marketplace,
  Abis.Marketplace
);
const multicallProvider = new Provider(provider, supportChainId);
const getNFTContract = (address) => {
  return new ethers.Contract(address, Abis.NFT, provider);
};
const getNFTContract_m = (address) => {
  return new Contract(address, Abis.NFT);
};
const contractDeploy = async (props) => {
  const { privateKey, name } = props;
  let wallet = new ethers.Wallet(privateKey, provider);

  let factory = new ethers.ContractFactory(Abis.NFT, Bytecode.NFT, wallet);
  let contract = await factory.deploy(name + "'s  NFT", name + 'NFT');
  await contract.deployed();

  return contract;
};
const contractGas = async (props) => {
  const { privateKey, name } = props;
  let wallet = new ethers.Wallet(privateKey, provider);

  let factory = new ethers.ContractFactory(Abis.NFT, Bytecode.NFT, wallet);
  const deploymentData = factory.interface.encodeDeploy([
    name + "'s  NFT",
    name + 'NFT',
  ]);

  let estimatedGas = await provider.estimateGas({
    data: deploymentData,
  });

  return estimatedGas;
};
const multicallHelper = async (calls) => {
  console.log("multicallHelper");
  let results = [];
  for (let i = 0; i < calls.length; i += 100) {
    const sCalls = calls.slice(i, i + 100);
    const res = await multicallProvider.all(sCalls);
    results = [...results, ...res];
  }
  return results;
};

module.exports = {
  provider,
  lazyNFTContract,
  multicallProvider,
  marketplaceContract,
  marketplaceContract_m,
  getNFTContract,
  getNFTContract_m,
  contractDeploy,
  contractGas,
  multicallProvider,
  multicallHelper,
};
