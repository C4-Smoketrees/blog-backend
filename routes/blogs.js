const router = require('express').Router();
const bson = require('bson');

const jwtAuth = require('../middleware/jwtAuth');
const jwtUnAuth = require('../middleware/jwtUnAuth');
const User = require('../modules/users/model');
const Blogs = require('../modules/blogs/model');

router.get('/one', jwtUnAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.query.blogId;
  const response = await Blogs.readBlogUsingId(blogId, req.app.locals.blogCollection, userId);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.get('/all', jwtUnAuth, async (req, res) => {
  const userId = req.userId;
  const response = await Blogs.readAllBlogs(req.app.locals.blogCollection, userId);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/delete', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body._id;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  const response = await user.deleteBlog(blogId, req.app.locals.userCollection, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/update', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blog = req.body.blog;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  blog._id = bson.ObjectID.createFromHexString(blog._id);
  const response = await Blogs.updateBlogContent(blog, user._id.toHexString(), req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/star', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  const response = await user.addStar(blogId, req.app.locals.userCollection, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/unstar', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  const response = await user.removeStar(blogId, req.app.locals.userCollection, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/upvote', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  await Blogs.removeDownvote(blogId, userId, req.app.locals.blogCollection);
  const response = await Blogs.addUpvote(blogId, userId, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/downvote', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  await Blogs.removeUpvote(blogId, userId, req.app.locals.blogCollection);
  const response = await Blogs.addDownvote(blogId, userId, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/removeUpvote', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  const response = await Blogs.removeUpvote(blogId, userId, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/removeDownvote', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const blogId = req.body.blogId;
  const response = await Blogs.removeDownvote(blogId, userId, req.app.locals.blogCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.get('/search', jwtUnAuth, async (req, res) => {
  const query = req.query.q;

  const lastDate = req.query.ld || Date.now();

  const userId = req.userId;
  const response = await Blogs.search(query, lastDate, req.app.locals.blogCollection, userId);

  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

module.exports = router;
