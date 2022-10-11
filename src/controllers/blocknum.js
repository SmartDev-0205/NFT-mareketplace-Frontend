const colors = require('colors');
const BLOCKNUM = require('../models/blockcount');

const BlockNumController = {
    create: async (props) => {
        try {
            const { id, latestBlock } = props;
            const newData = new BLOCKNUM({
                id: id,
                latestBlock: latestBlock,
            });

            const result = await newData.save();

            return result;
        } catch (err) {
            console.log(colors.red(err.message0));
        }
    },

    find: async (props) => {
        try {
            const { id } = props;

            const result = BLOCKNUM.findOne({ id: id });

            return result;
        } catch (err) {
            console.log(colors.red(err.message));
        }
    },

    update: async (props) => {
        const { id, latestBlock } = props;

        const result = await BLOCKNUM.updateOne(
            { id: id },
            {
                $set: {
                    latestBlock: latestBlock,
                },
            }
        );

        return result;
    },
};

module.exports = { BlockNumController };
