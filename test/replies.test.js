const { assert } = require('chai');
const { describe, it } = require('mocha');
const app = require('../app');
const Blog = require('../modules/blogs/model');
const Comment = require('../modules/comments/model');
const bson = require('bson');

describe('# Replies test-suite', function () {
  describe('# CRUD for comments', function () {
    it('Create a new Comment', async function () {
      const blog = new Blog({ content: 'comment blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const comment = new Comment({ content: 'comment', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res2 = await Comment.createComment(comment, { blogId: blog._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res2.status);

      const res3 = await Comment.createComment(comment, { commentId: comment._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);
    });

    it('update a Comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res3 = await Comment.createComment(comment2, { blogId: blog._id.toHexString() }, app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);
      comment1.content = 'update comment';

      const res4 = await Comment.updateCommentContent(comment1, author.toHexString(), app.locals.commentCollection);
      assert.isTrue(res4.status);

      comment1._id = new bson.ObjectID(bson.ObjectID.generate());
      const res5 = await Comment.updateCommentContent(comment2, author.toHexString(), app.locals.commentCollection);
      assert.isFalse(res5.status);
    });
    it('delete a Comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
        app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: author });
      const res5 = await Comment.createComment(comment2, { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res5.status);

      const res4 = await Comment.deleteComment(comment2._id.toHexString(), { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res4.status);

      const res3 = await Comment.deleteComment(comment1._id.toHexString(), { blogId: blog._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);
    });

    it('Upvote a comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
        app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: author });
      const res3 = await Comment.createComment(comment2, { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);

      const res4 = await Comment.addCommentUpvote(comment1._id.toHexString(), author.toHexString()
        , app.locals.commentCollection);
      assert.isTrue(res4.status);
      const res5 = await Comment.addCommentUpvote(comment2._id.toHexString(), author.toHexString(),
        app.locals.commentCollection);
      assert.isTrue(res5.status);
      const res6 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res6.status);
      assert.equal(res6.comment.upvotesCount, 1);
      const res7 = await Comment.readComment(comment2._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res7.status);
      assert.equal(res7.comment.upvotesCount, 1);
    });

    it('Downvote a comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
        app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: author });
      const res3 = await Comment.createComment(comment2, { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);

      const res4 = await Comment.addCommentDownvote(comment1._id.toHexString(), author.toHexString()
        , app.locals.commentCollection);
      assert.isTrue(res4.status);
      const res5 = await Comment.addCommentDownvote(comment2._id.toHexString(), author.toHexString(),
        app.locals.commentCollection);
      assert.isTrue(res5.status);
      const res6 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res6.status);
      assert.equal(res6.comment.downvotesCount, 1);
      const res7 = await Comment.readComment(comment2._id.toHexString(), app.locals.commentCollection, author.toHexString());
      assert.isTrue(res7.status);

      assert.equal(res7.comment.downvotesCount, 1);
    });

    it('remove Upvote a comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
        app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: author });
      const res3 = await Comment.createComment(comment2, { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);

      const res4 = await Comment.addCommentUpvote(comment1._id.toHexString(), author.toHexString()
        , app.locals.commentCollection);
      assert.isTrue(res4.status);
      const res5 = await Comment.addCommentUpvote(comment2._id.toHexString(), author.toHexString(),
        app.locals.commentCollection);
      assert.isTrue(res5.status);
      const res6 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res6.status);
      assert.equal(res6.comment.upvotesCount, 1);
      const res7 = await Comment.readComment(comment2._id.toHexString(), app.locals.commentCollection, author.toHexString());
      assert.isTrue(res7.status);

      assert.equal(res7.comment.upvotesCount, 1);
      const res8 = await Comment.removeCommentUpvote(comment1._id.toHexString(), author.toHexString(), app.locals.commentCollection);
      assert.isTrue(res8.status);
      const res9 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res9.status);
      assert.equal(res9.comment.upvotesCount, 0);
    });
    it('remove downvote a comment', async function () {
      const blog = new Blog({ content: 'update blog', author: new bson.ObjectID(bson.ObjectID.generate()) });
      const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
      assert.isTrue(res1.status);

      const author = new bson.ObjectID(bson.ObjectID.generate());

      const comment1 = new Comment({ content: 'comment 1', author: author });
      const res2 = await Comment.createComment(comment1, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
        app.locals.commentCollection);
      assert.isTrue(res2.status);

      const comment2 = new Comment({ content: 'comment 2', author: author });
      const res3 = await Comment.createComment(comment2, { commentId: comment1._id.toHexString() },
        app.locals.blogCollection, app.locals.commentCollection);
      assert.isTrue(res3.status);

      const res4 = await Comment.addCommentDownvote(comment1._id.toHexString(), author.toHexString()
        , app.locals.commentCollection);
      assert.isTrue(res4.status);
      const res5 = await Comment.addCommentDownvote(comment2._id.toHexString(), author.toHexString(),
        app.locals.commentCollection);
      assert.isTrue(res5.status);
      const res6 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res6.status);
      assert.equal(res6.comment.downvotesCount, 1);
      const res7 = await Comment.readComment(comment2._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res7.status);
      assert.equal(res7.comment.downvotesCount, 1);
      const res8 = await Comment.removeCommentDownvote(comment1._id.toHexString(), author.toHexString(), app.locals.commentCollection);
      assert.isTrue(res8.status);
      const res9 = await Comment.readComment(comment1._id.toHexString(), app.locals.commentCollection);
      assert.isTrue(res9.status);
      assert.equal(res9.comment.downvotesCount, 0);
    });
  });
});
