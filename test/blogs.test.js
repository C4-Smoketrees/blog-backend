const { assert } = require('chai');
const { describe, before, it, after } = require('mocha');
const app = require('../app');
const Blog = require('../modules/blogs/model');
const bson = require('bson');
const MongoClient = require('mongodb').MongoClient;
const logger = require('../logging/logger');

after(async function () {
  await app.locals.dbClient.close();
});
before(async function () {
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
      await app.locals.blogCollection.createIndex({ content: 'text', title: 'text', tags: 'text' });
    } catch (e) {
      logger.warn(e);
      process.exit(2);
    }
  };
  return dbConn().then(() => { logger.info('Connection established to mongoDB'); });
});
describe('# Blogs test-suite', function () {
  describe('# Crud Operations', function () {
    // Create a new Blog and update it
    it('Return false if no tags are found', async function () {
      await app.locals.tagCollection.drop();
      const res = await Blog.readAllTags(app.locals.tagCollection);
      assert.isFalse(res.status);
    });
    it('Create a new Blog and update it', async function () {
      // For Callback (Passing)
      try {
        const author = new bson.ObjectID(bson.ObjectID.generate());
        const blog = new Blog({
          author: author,
          title: 'test title',
          content: 'test content'
        });
        const res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        blog.content = 'update content';
        const res2 = await Blog.updateBlogContent(blog, author.toHexString(), app.locals.blogCollection);
        assert.isTrue(res2.status);
        blog._id = new bson.ObjectID(bson.ObjectID.generate());
        const res3 = await Blog.updateBlogContent(blog, app.locals.blogCollection);
        assert.isFalse(res3.status);
      } catch (e) {
      }
    });
    it('Create a new Blog and read it', async function () {
      // For Callback (Passing)
      try {
        const user1 = new bson.ObjectID(bson.ObjectID.generate());
        const user2 = new bson.ObjectID(bson.ObjectID.generate());
        const blog = new Blog({
          author: user1,
          content: 'read content'
        });
        const res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        await Blog.addUpvote(blog._id.toHexString(), user1.toHexString(), app.locals.blogCollection);
        await Blog.addUpvote(blog._id.toHexString(), user2.toHexString(), app.locals.blogCollection);
        const res2 = await Blog.readBlogUsingId(blog._id.toHexString(), app.locals.blogCollection, user2.toHexString());

        assert.equal('read content', res2.blog.content);
        const res3 = await Blog.readBlogUsingId(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), app.locals.blogCollection);
        assert.isFalse(res3.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
    it('Read all blogs', async function () {
      // For Callback (Passing)
      try {
        const author = new bson.ObjectID(bson.ObjectID.generate());
        const blog = new Blog({
          author: author,
          content: 'read content'
        });
        const res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        const res2 = await Blog.readAllBlogs(app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Blog.readAllBlogs(app.locals.blogCollection, author.toHexString());
        assert.isTrue(res3.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
    it('Create a new Blog and delete it', async function () {
      // For Callback (Passing)
      try {
        const blog = new Blog({ author: new bson.ObjectID(bson.ObjectID.generate()), content: 'delete content' });
        const res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        const res2 = await Blog.deleteBlogUsingId(blog._id.toHexString(), app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Blog.deleteBlogUsingId(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), app.locals.blogCollection);
        assert.isFalse(res3.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
    it('Find using blog tag', async function () {
      try {
        const blog = new Blog({
          author: new bson.ObjectID(bson.ObjectID.generate()),
          content: 'tag content',
          tags: ['google', 'noob']
        });
        let res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        blog.tags = ['google', 'twitter'];
        res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        blog.tags = ['hello', 'twitter'];
        res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        res = await Blog.readBlogByTag('twitter', app.locals.blogCollection);

        assert.isTrue(res.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
    it('Create a new Blog and change it stars', async function () {
      try {
        const blog = new Blog({
          author: new bson.ObjectID(bson.ObjectID.generate()),
          content: 'stars content'
        });
        const res = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res.status);
        const res2 = await Blog.updateStars(blog._id.toHexString(), 'inc', app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Blog.updateStars(blog._id.toHexString(), 'inc', app.locals.blogCollection);
        assert.isTrue(res3.status);
        const res4 = await Blog.updateStars(blog._id.toHexString(), 'dec', app.locals.blogCollection);
        assert.isTrue(res4.status);
        const res5 = await Blog.readBlogUsingId(blog._id.toHexString(), app.locals.blogCollection);
        assert.equal(res5.blog.stars, 1, 'Stars expected');
        const res6 = await Blog.updateStars(new bson.ObjectID(bson.ObjectID.generate()).toHexString(),
          'inc', app.locals.blogCollection);
        assert.isFalse(res6.status);
        const res7 = await Blog.updateStars(blog._id.toHexString(), 'invalid', app.locals.blogCollection);
        assert.isFalse(res7.status);
      } catch (e) {
        assert.equal(e.message, 'Illegal Command');
      }
    });
    it('Upvote content', async function () {
      try {
        const blog = new Blog({
          author: new bson.ObjectID(bson.ObjectID.generate()),
          content: 'upvote content'
        });
        const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res1.status);
        const user = new bson.ObjectID(bson.ObjectID.generate());
        const res2 = await Blog.addUpvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Blog.addUpvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isFalse(res3.status);
        const res4 = await Blog.removeUpvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res4.status);
        const res6 = await Blog.removeUpvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isFalse(res6.status);
        const res5 = await Blog.addUpvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res5.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
    it('Downvote content', async function () {
      try {
        const blog = new Blog({
          author: new bson.ObjectID(bson.ObjectID.generate()),
          content: 'upvote content'
        });
        const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res1.status);
        const user = new bson.ObjectID(bson.ObjectID.generate());
        const res2 = await Blog.addDownvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Blog.addDownvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isFalse(res3.status);
        const res4 = await Blog.removeDownvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res4.status);
        const res6 = await Blog.removeDownvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isFalse(res6.status);
        const res5 = await Blog.addDownvote(blog._id.toHexString(), user.toHexString(), app.locals.blogCollection);
        assert.isTrue(res5.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });

    // Error cases
    it('Catch error in creating a blog', async function () {
      try {
        const res = await Blog.createBlog(null, app.locals.blogCollection);
        assert.isFalse(res.status);
        assert.isNotNull(res.err);
      } catch (e) {
      }
    });
    it('Catch error in updating a blog', async function () {
      const author = new bson.ObjectID(bson.ObjectID.generate());
      const blog = new Blog({
        author: author,
        title: 'test title',
        content: 'test content'
      });
      const res = await Blog.updateBlogContent(blog, author.toHexString(), app.locals.blogCollection);
      assert.isFalse(res.status);
    });
    it('Catch error in reading all blogs', async function () {
      const res = await Blog.readAllBlogs(null);
      assert.isFalse(res.status);
    });
    it('Catch error in deleting blog by ID', async function () {
      const res = await Blog.deleteBlogUsingId(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in getting all tags', async function () {
      const res = await Blog.readAllTags(null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in updating stars', async function () {
      const res = await Blog.updateStars(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), 'inc', null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in reading all blogs by tag', async function () {
      const res = await Blog.readBlogByTag('something', null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in adding upvotes', async function () {
      const res = await Blog.addUpvote(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), new bson.ObjectID(bson.ObjectID.generate()).toHexString(), null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in adding downvotes', async function () {
      const res = await Blog.addDownvote(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), new bson.ObjectID(bson.ObjectID.generate()).toHexString(), null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in removing upvotes', async function () {
      const res = await Blog.removeUpvote(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), new bson.ObjectID(bson.ObjectID.generate()).toHexString(), null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Catch error in removing downvotes', async function () {
      const res = await Blog.removeDownvote(new bson.ObjectID(bson.ObjectID.generate()).toHexString(), new bson.ObjectID(bson.ObjectID.generate()).toHexString(), null);
      assert.isFalse(res.status);
      assert.isNotNull(res.err);
    });
    it('Search', async function () {
      const res = await Blog.search('content', Date.now(), app.locals.blogCollection);
      assert.isTrue(res.status);
    });
  });
});
