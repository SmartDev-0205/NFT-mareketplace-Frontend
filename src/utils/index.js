/** @format */

const { ethers } = require('ethers');
const CID = require('cids')

const lookupPromise = async (domain) => {
  return new Promise((resolve, reject) => {
    dns.lookup('domain', (err, address, family) => {
      if (err) reject(err);
      resolve(address);
    });
  });
};

/**
 * set delay for delayTimes
 * @param {Number} delayTimes - timePeriod for delay
 */
function delay(delayTimes) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(2);
    }, delayTimes);
  });
}

/**
 * change data type from Number to BigNum
 * @param {Number} value - data that need to be change
 * @param {Number} d - decimals
 */
function toBigNum(value, d = 18) {
  return ethers.utils.parseUnits(String(value), d);
}

/**
 * change data type from BigNum to Number
 * @param {Number} value - data that need to be change
 * @param {Number} d - decimals
 */
function fromBigNum(value, d = 18) {
  return ethers.utils.formatUnits(value, d);
}

/**
 * change data array to no duplicate
 */
function getNoDoubleArray(value) {
  let newArray = [];
  for (let i = 0; i < value.length; i++) {
    if (newArray.indexOf(value[i]) === -1) {
      newArray.push(value[i]);
    }
  }
  return newArray;
}

function getValidHttpUrl(data) {
  let url;
  try {
    url = new URL(data);
  } catch (_) {
    const cid = new CID(data);
    // ipfs hash : Qm...
    return process.env.IPFS_BASEURL + data;
  }
  if (url.protocol === "http:" || url.protocol === "https:") return data;
  if (url.protocol === "ipfs:") {
    return "https://nftstorage.link/ipfs/" + url.hostname + url.pathname;
  }
  throw new Error("invalid");
}

module.exports = {
  delay,
  toBigNum,
  fromBigNum,
  lookupPromise,
  getNoDoubleArray,
  getValidHttpUrl
};
