require('dotenv').config();

module.exports = {
    mongoURI: 'mongodb://127.0.0.1:27017/db_picasso',
    secretOrKey: process.env.TOKEN_SECRET || 'picasso',
    port: process.env.PORT,
};
