const { handleSync } = require('./handlerSync');
const { handleTransation } = require('./handleEvent');

const blockchainHandle = async () => {
    try {
        await handleSync();
        handleTransation();
    } catch (err) {
        console.log('blockchain handle: ' + err.message);
    }
};

module.exports = blockchainHandle;
