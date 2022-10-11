var colors = require('colors');
const cron = require('node-cron');
const ethers = require('ethers');
const { provider } = require('../contracts');

const handleEvent = async (props) => {
    const {
        id,
        provider,
        contract,
        event,
        times,
        handler,
        BlockNumController,
    } = props;

    var latestblocknumber;
    const handletransactions = async () => {
        try {
            let blockNumber = await provider.getBlockNumber();
            console.log(
                'handle transactions : ',
                contract.address,
                event,
                latestblocknumber,
                blockNumber
            );
            if (blockNumber > latestblocknumber) {
                blockNumber =
                    blockNumber > latestblocknumber + 20
                        ? latestblocknumber + 20
                        : blockNumber;

                var txhistory = contract.queryFilter(
                    event,
                    latestblocknumber + 1,
                    blockNumber
                );
                await txhistory.then(async (res) => {
                    for (var index in res) {
                        handler(res[index], id);
                    }
                });
                latestblocknumber = blockNumber;

                await BlockNumController.update({
                    id: id,
                    latestBlock: blockNumber,
                });
            }
        } catch (err) {
            if (err.reason === 'missing response') {
                console.log(colors.red('you seem offline'));
            } else {
                console.log('err', err.reason);
            }
        }
    };

    const handleEvent = async () => {
        try {
            var blockNumber = (await BlockNumController.find({ id: id }))
                .latestBlock;
            if (!blockNumber) throw new Error('not find');
        } catch (err) {
            blockNumber = await provider.getBlockNumber();
            await BlockNumController.create({
                id: id,
                latestBlock: blockNumber,
            });
        }
        latestblocknumber = blockNumber;
        cron.schedule(`*/${times} * * * * *`, () => {
            console.log(`running a transaction handle every ${times} second`);
            handletransactions();
        });
    };

    handleEvent();
};

const sign = async (data) => {
    const { tokenId, owner, market, _priceInWei, _expiresAt, signer } = data;

    try {
        let messageHash = ethers.utils.solidityKeccak256(
            ['uint', 'address', 'address', 'uint', 'uint'],
            [tokenId, owner, market, _priceInWei, _expiresAt]
        );
        let signature = await signer.signMessage(
            ethers.utils.arrayify(messageHash)
        );
        return signature;
    } catch (err) {
        console.log(err);
        throw new Error(err.message);
    }
};

const getSigner = async (props) => {
};
const getAdmin = async () => {
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
    return ethers.utils.parseUnits(Number(value).toFixed(8), d);
}

/**
 * change data type from BigNum to Number
 * @param {Number} value - data that need to be change
 * @param {Number} d - decimals
 */
function fromBigNum(value, d = 18) {
    return ethers.utils.formatUnits(value, d);
}

module.exports = {
    handleEvent,
    sign,
    delay,
    toBigNum,
    fromBigNum,
    getSigner,
    getAdmin,
};
