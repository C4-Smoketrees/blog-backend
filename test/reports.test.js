const { assert } = require('chai');
const { describe, it } = require('mocha');
const app = require('../app');
const Blog = require('../modules/blogs/model');
const Comment = require('../modules/comments/model');
const Report = require('../modules/reports/model');
const bson = require('bson');

describe('# Reports test-suite', function () {
  describe('# CRUD for reports', function () {
    it('Create a report', async function () {
      try {
        const blog = new Blog({ author: new bson.ObjectID(bson.ObjectID.generate()), content: 'report content' });
        const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res1.status);
        const report = new Report({
          reportReason: 1,
          userId: new bson.ObjectId(bson.ObjectID.generate())
        });
        const res2 = await Report.createReport(blog._id.toHexString(), report, app.locals.blogCollection);
        assert.isTrue(res2.status);
        const res3 = await Report.createReport(blog._id.toHexString(), report, app.locals.blogCollection);
        assert.isFalse(res3.status);
        blog._id = new bson.ObjectID(bson.ObjectID.generate());
        const res4 = await Report.createReport(blog._id.toHexString(), report, app.locals.blogCollection);
        assert.isFalse(res4.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });

    it('Create a report for comments', async function () {
      try {
        const blog = new Blog({ author: new bson.ObjectID(bson.ObjectID.generate()), content: 'report content' });
        const res1 = await Blog.createBlog(blog, app.locals.blogCollection);
        assert.isTrue(res1.status);
        const comment = new Comment({ author: new bson.ObjectID(bson.ObjectID.generate()), content: '12' });
        const res5 = await Comment.createComment(comment, { blogId: blog._id.toHexString() }, app.locals.blogCollection,
          app.locals.commentCollection);
        assert.isTrue(res5.status);
        const report = new Report({
          reportReason: 1,
          userId: new bson.ObjectId(bson.ObjectID.generate())
        });
        const res2 = await Report.createCommentReport(comment._id.toHexString(), report, app.locals.commentCollection);
        assert.isTrue(res2.status);
        const res3 = await Report.createCommentReport(comment._id.toHexString(), report, app.locals.commentCollection);
        assert.isFalse(res3.status);
      } catch (e) {
        assert.isTrue(false);
      }
    });
  });
});
