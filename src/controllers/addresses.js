/** @format */
const colors = require('colors');
const ADDRESSES = require('../models/addresses');

const AddressController = {
    create: async (props) => {
        const { newAddress } = props;

        try {
            const result = await ADDRESSES.updateOne({
                $push: {
                    nfts: newAddress,
                },
            });

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
    getAddresses: async (props) => {
        try {
            const { id } = props; // 1: default address, 2: marketplace
            const result = await ADDRESSES.find();

            if (id === 1) return result[0]._doc.nfts;
            else if (id === 2) return result[0].marketplace;
        } catch (err) {
            console.log(colors.red(err));
            return null;
        }
    },
};

module.exports = { AddressController };
