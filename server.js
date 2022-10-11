const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const router = express.Router();
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const config = require('./src/config');
const { Router } = require('./src/api/routes');
const { typeDefs } = require('./src/config/graphql');
const { resolvers } = require('./src/graphql');
const blockchainHandler = require('./src/blockchainApis');

const app = express();

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(
  cors({
    origin: '*',
    methods: ['POST', 'GET'],
  })
);

// Connect to MongoDB
mongoose
  .connect(config.mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Use Routes
{
  //gas station
  //  Because Stripe needs the raw body, we compute it but only when hitting the Stripe callback URL.
  app.use(
    express.json({
      verify: (req, res, buf) => {
        if (req.originalUrl.startsWith('/payment/session-complete')) {
          req.rawBody = buf.toString();
        }
      },
    })
  );
}

Router(router);
app.use('/api', router);

//blockchain Handle
blockchainHandler();

app.use(express.static(__dirname + '/build'));
app.get('/*', function (req, res) {
  console.log("reqest", req.url);
  let urlIndex = -1;
  const staticUrls = ["static", "manifest", "favicon", "logo"];
  staticUrls.forEach((staticUrl) => {
    console.log(staticUrl);
    if (urlIndex != -1) return;
    urlIndex = req.url.indexOf(staticUrl)
  })

  if (urlIndex != -1) {
    console.log(__dirname + '/build/' + req.url.slice(urlIndex));
    return res.sendFile(__dirname + '/build/' + req.url.slice(urlIndex));
  }

  res.sendFile(__dirname + '/build/index.html', function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

const startApolloServer = async (typeDefs, resolvers) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    // context: async ({ req, res }) => {
    //     const token = req.headers.authorization || "";
    //     jwt.verify(token, process.env.JWT_SECRET, async (err, _) => {
    //         if (err) return res.sendStatus(403);
    //     });
    // },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = config.port || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startApolloServer(typeDefs, resolvers);
