const router = require('express').Router();
const jwtAuth = require('../middleware/jwtAuth');
const jwtUnAuth = require('../middleware/jwtUnAuth');
const bson = require('bson');
const User = require('../modules/users/model');
const Comment = require('../modules/comments/model');
const Blog = require('../modules/blogs/model');

router.get('/', jwtUnAuth, async (req, res) => {
  const userId = req.userId;
  const commentId = req.query.commentId;
  const response = await Comment.readComment(commentId, req.app.locals.commentCollection, userId);

  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

router.post('/', jwtAuth, async (req, res) => {
  const userId = req.userId;
  const id = req.body.id;
  const comment = req.body.comment;
  comment.author = bson.ObjectID.createFromHexString(userId);
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  const response = await user.addComment(comment, id, req.app.locals.userCollection,
    req.app.locals.blogCollection, req.app.locals.commentCollection);
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
  const id = req.body.id;
  const commentId = req.body.commentId;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  const response = await user.deleteComment(commentId, id, req.app.locals.userCollection,
    req.app.locals.blogCollection, req.app.locals.commentCollection);
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
  const comment = req.body.comment;
  const user = new User({ _id: bson.ObjectID.createFromHexString(userId) });
  comment._id = bson.ObjectID.createFromHexString(comment._id);
  const response = await Comment.updateCommentContent(comment, user._id.toHexString(), req.app.locals.commentCollection);
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
  const commentId = req.body.commentId;
  await Comment.removeCommentDownvote(commentId, userId, req.app.locals.commentCollection);
  const response = await Comment.addCommentUpvote(commentId, userId, req.app.locals.commentCollection);
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
  const commentId = req.body.commentId;
  await Comment.removeCommentUpvote(commentId, userId, req.app.locals.commentCollection);
  const response = await Comment.addCommentDownvote(commentId, userId, req.app.locals.commentCollection);
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
  const commentId = req.body.commentId;
  const response = await Comment.removeCommentUpvote(commentId, userId, req.app.locals.commentCollection);
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
  const commentId = req.body.commentId;
  const response = await Blog.removeDownvote(commentId, userId, req.app.locals.commentCollection);
  if (response.status) {
    res.status(200).json(response);
  } else if (response.err) {
    res.status(500).json(response);
  } else {
    res.status(400).json(response);
  }
});

module.exports = router;
