const app = require('express')();
const MongoClient = require('mongodb').MongoClient;

const compression = require('compression');
const sanitizer = require('express-sanitizer');
const parser = require('body-parser');
const morgan = require('./logging/morgan');
const logger = require('./logging/logger');
const cors = require('cors');

// Connect to the database
const dbConnectionString = 'mongodb://localhost:27017' || process.env.DB_CONN_STRING;
const dbConn = async () => {
  try {
    const dbPromise = MongoClient.connect(dbConnectionString, { useUnifiedTopology: true });
    app.locals.dbClient = await dbPromise;
    app.locals.db = await app.locals.dbClient.db('forum');
    app.locals.blogCollection = await app.locals.db.collection('blogs');
    app.locals.commentCollection = await app.locals.db.collection('comments');
    app.locals.userCollection = await app.locals.db.collection('users');
    app.locals.tagCollection = await app.locals.db.collection('tags');
  } catch (e) {
    logger.warn(e);
    process.exit(2);
  }
};
dbConn().then(() => { logger.info('Connection established to mongoDB'); });

// Middlewares
app.use(sanitizer());
app.use(parser.json());
app.use(compression());
app.use(cors());

// Logging
app.use('/drafts', require('./routes/draft'));
app.use('/blogs', require('./routes/blogs'));
app.use('/reports', require('./routes/report'));
app.use('/comments', require('./routes/comment'));

app.use('*', function (_req, res) {
  res.status(400).json({ status: false, message: 'Resource Not found' });
});

app.use(morgan);

// Define routes

module.exports = app;
