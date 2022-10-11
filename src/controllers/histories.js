const Histories = require("../models/histroies");

const HistoryController = {
  create: async (props) => {
    const {
      event,
      contractAddress,
      tokenID,
      price = "0",
      acceptedToken = "",
      userAddress
    } = props;

    const newData = new Histories({
      event,
      contractAddress,
      tokenID,
      price,
      acceptedToken,
      userAddress,
      timeStamp: Date.now()
    });
    console.log(newData);
    await newData.save();
  },
  find: async (filter) => {
    return await Histories.findOne(filter);
  },
  finds: async (filter) => {
    return await Histories.find(filter);
  },
  update: async (filter, newData) => {
    return await Histories.updateOne(
      filter,
      { $set: newData }
    );
  },
  remove: async (filter) => {
    return await Histories.findOneAndDelete(
      filter
    );
  }
};

module.exports = { HistoryController };