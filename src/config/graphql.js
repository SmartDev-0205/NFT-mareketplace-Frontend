const { gql } = require('apollo-server-express');

const typeDefs = gql`
    scalar Date

    type attributes {
        key: String
        value: String
        trait_type: String
    }

    type NFTmetadata {
        name: String
        description: String
        coverImage: String
        image: String
        external_url1: String
        external_url2: String
        external_url3: String
        external_url4: String
        external_url5: String
        fee: Float
        fee_recipent: String
    }

    type metadata {
        image: String
        external_url1: String
        external_url2: String
        external_url3: String
        external_url4: String
        external_url5: String
        description: String
        name: String
        attributes: [attributes]
    }

    type marketdata {
        price: String
        acceptedToken: String
        owner: String
        startTime: String
        endTime: String
        bidder: String
        bidPrice: String
        prices: [String]
        tokens: [String]
        owners: [String]
        bidders: [String]
        bidPrices: [String]
        bidTokens: [String]
        bidTime: [String]
    }

    type item {
        tokenID: String
        collectionAddress: String
        likes: [String]
        creator: String
        owner: String
        metadata: metadata
        marketdata: marketdata
        isOffchain: Boolean
    }

    type NFTs {
        address: String
        metadata: NFTmetadata
        items: [item]
    }

    type User {
        address: String
        name: String
        bio: String
        email: String
        image: String
        bannerImage: String
        link1: String
        link2: String
        link3: String
        link4: String
    }

    type Prices {
        ETHEURPrice: Float
        ETHUSDPrice: Float
        ETHJPYPrice: Float
    }

    type Order {
        orderId: String
        contractAddress: String
        assetId: String
        price: String
        acceptedToken: String
        assetOwner: String
        status: String
    }

    type Activity {
        event: String
        contractAddress: String
        tokenID: String
        price: String
        acceptedToken: String
        timeStamp: String
        userAddress: String
    }

    type Query {
        getAllNFTs: [item]
        getNFTs(address: String): [item]
        getCollectionNFTs: [NFTs]
        getCollectionNFT(address: String): [NFTs]
        getUsersInfo: [User]
        getPrice: Prices
        getOrder: [Order]
        getActivity: [Activity]
    }
`;

module.exports = { typeDefs };
