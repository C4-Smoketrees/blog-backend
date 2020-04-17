const app = require('../app.js');
const chai = require('chai');
const assert = chai.assert;
const bson = require('bson');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
const Comment = require('../modules/comments/model');
chai.use(chaiHttp);
const User = require('../modules/users/model');
const jwt = require('jsonwebtoken');

describe('# Route test for /comments', function () {
  it('test for /', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    assert.isTrue(res2.status);

    const res = await chai.request(app)
      .post('/comments')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({ id: { blogId: res2.blogId }, comment: { content: 'comment' } });

    assert.equal(res.status, 200);
  });

  it('test for /delete', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/delete')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({ id: { blogId: res2.blogId }, commentId: res3.commentId });

    assert.equal(res.status, 200);
  });

  it('test for /update', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    // const author1 = new bson.ObjectID(bson.ObjectID.generate())
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/update')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({
        comment: {
          _id: res3.commentId,
          content: 'update'
        }
      });
    assert.equal(res.status, 200);
  });

  it('test for  route /upvote', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    // const author1 = new bson.ObjectID(bson.ObjectID.generate())
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/upvote')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({
        commentId: res3.commentId
      });

    assert.equal(res.status, 200);
  });

  it('test for  route /downvote', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    // const author1 = new bson.ObjectID(bson.ObjectID.generate())
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/downvote')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({
        commentId: res3.commentId
      });

    assert.equal(res.status, 200);
  });

  it('test for  route /removeUpvote', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    // const author1 = new bson.ObjectID(bson.ObjectID.generate())
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    await Comment.addCommentUpvote(res3.commentId, token._id, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/removeUpvote')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({
        blogId: res2.blogId,
        commentId: res3.commentId
      });

    assert.equal(res.status, 200);
  });

  it('test for  route /removeDownvote', async function () {
    const draft = { content: 'draft content', title: 'draft title', tags: ['#google', '#noob'] };
    const token = jwt.decode('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k');
    const author1 = bson.ObjectID.createFromHexString(token._id);
    // const author1 = new bson.ObjectID(bson.ObjectID.generate())
    const res1 = await User.createDraft(author1.toHexString(), draft, app.locals.userCollection, app.locals.tagCollection);
    const user = new User({ _id: author1 });
    const res2 = await user.publishDraft(res1.draftId, app.locals.userCollection, app.locals.blogCollection);
    const res3 = await user.addComment({
      content: 'comment',
      author: author1
    }, { blogId: res2.blogId }, app.locals.userCollection, app.locals.blogCollection, app.locals.commentCollection);

    await Comment.addCommentDownvote(res3.commentId, token._id, app.locals.commentCollection);

    const res = await chai.request(app)
      .post('/comments/upvote')
      .set({
        Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFjaGhhcG9saWExMCIsIl9pZCI6IjVlODYxNzg0ZTg1NDY2ZmJhYmQyNTc2OCIsImlhdCI6MTU4NTg0NjI0Mn0.vJ5pQfIUX8jGSodwiKhxI9pP5HLFiko7uHUSLWeXM2k',
        'Content-Type': 'application/json'
      })
      .send({
        blogId: res2.blogId,
        commentId: res3.commentId
      });

    assert.equal(res.status, 200);
  });
});
