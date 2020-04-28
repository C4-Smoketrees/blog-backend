const ObjectId = require('bson').ObjectID;
const logger = require('../../logging/logger');
const Blog = require('../blogs/model');
const Comment = require('../comments/model');

/**
 * User class represents the business logic
 */
class User {
  constructor (object) {
    this._id = object._id;
    this.stars = object.stars;
    this.blogs = object.blogs;
    this.replies = object.replies;
    this.drafts = object.drafts;
  }

  /**
   *
   * @param {string} userId
   * @param {{content:string,title:string,_id?:ObjectId,tags:string[]}} draft
   * @param {Collection} userCollection
   * @param {Collection} tagCollection
   * @returns {Promise<void>}
   */
  static async createDraft (userId, draft, userCollection, tagCollection) {
    let response;
    try {
      draft._id = new ObjectId(ObjectId.generate());
      const filter = { _id: ObjectId.createFromHexString(userId) };
      const query = { $push: { drafts: draft } };
      const res = await userCollection.updateOne(filter, query, { upsert: true });
      if (res.modifiedCount === 1) {
        response = { status: true, draftId: draft._id.toHexString() };
        logger.debug(`Created a draft for user:${userId} draftId:${draft._id.toHexString()}`);
      } else {
        response = { status: true, draftId: draft._id.toHexString(), userId: res.upsertedId._id.toHexString() };
        logger.debug(`Created a draft for user:${userId} draftId:${draft._id.toHexString()}`);
      }
      if (draft.tags) {
        const tags = draft.tags;
        for (const tag of tags) {
          await tagCollection.updateOne({}, { $addToSet: { tags: tag } }, { upsert: true });
        }
      }
    } catch (e) {
      response = { status: false, err: e };
      logger.error(`Error in creating a draft for user:${userId}`, { err: e });
    }
    return response;
  }

  static async updateDraft (userId, draft, userCollection, tagCollection) {
    let response;
    try {
      const filter = {
        _id: ObjectId.createFromHexString(userId),
        drafts: { $elemMatch: { _id: draft._id } }
      };
      const query = {
        $set: {
          'drafts.$.content': draft.content,
          'drafts.$.title': draft.title,
          'drafts.$.tags': draft.tags,
          'drafts.$.coverImage': draft.coverImage
        }
      };

      const res = await userCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        response = { status: true, draftId: draft._id };
        logger.debug(`updated a draft for user:${userId} draftId:${draft._id.toHexString()}`);
      } else {
        response = { status: false, res: res };
        logger.debug(`Unable to update a draft for user:${userId} draft:${draft._id.toHexString()}`);
      }
      if (draft.tags) {
        const tags = draft.tags;
        for (const tag of tags) {
          await tagCollection.updateOne({}, { $addToSet: { tags: tag } }, { upsert: true });
        }
      }
    } catch (e) {
      response = { status: false, err: e };

      logger.error(`Error in updating a draft for user:${userId}`, { err: e });
    }
    return response;
  }

  static async readDraft (userId, draftId, userCollection) {
    let response;
    try {
      const filter = {
        _id: ObjectId.createFromHexString(userId),
        drafts: { $elemMatch: { _id: ObjectId.createFromHexString(draftId) } }
      };
      const projection = {
        drafts: { $elemMatch: { _id: ObjectId.createFromHexString(draftId) } }
      };
      const res = await userCollection.findOne(filter, { projection: projection });
      if (res) {
        response = { status: true, draft: res.drafts[0] };
        return response;
      }
      response = { status: false };
    } catch (e) {
      response = { status: false, err: e };
      logger.error(`Error in reading a draft for user:${userId}`);
    }
    return response;
  }

  static async deleteDraft (userId, draftId, userCollection) {
    let response;
    try {
      const filter = { _id: ObjectId.createFromHexString(userId) };
      const query = {
        $pull: { drafts: { _id: ObjectId.createFromHexString(draftId) } }
      };
      const res = await userCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        response = { status: true, draftId: draftId };
        logger.debug(`Deleted a draft for user:${userId} draftId:${draftId}`);
      } else {
        response = { status: false, draftId: draftId, res: res };
        logger.debug(`Unable to delete draft for user:${userId} draftId:${draftId}`);
      }
    } catch (e) {
      response = { status: false, err: e };
      logger.error(`Error in deleting a draft for user:${userId}`);
    }
    return response;
  }

  async publishDraft (draftId, userCollection, blogCollection) {
    const draft = (await User.readDraft(this._id.toHexString(), draftId, userCollection)).draft;

    const blog = new Blog({
      content: draft.content,
      title: draft.title,
      author: this._id,
      tags: draft.tags,
      coverImage: draft.coverImage,
      authorName: draft.authorName
    });
    let response;
    const res = await Blog.createBlog(blog, blogCollection);
    if (!res.status) {
      if (res.err) {
        response = { status: false, msg: 'error occurred', err: res.err };
      }
      response = { status: false };
      return response;
    }
    try {
      const filter = { _id: this._id };
      const query = { $push: { blogs: blog._id } };
      const res2 = await userCollection.updateOne(filter, query, { upsert: true });
      if (res2.modifiedCount !== 1) {
        logger.error('Error in publishing draft(adding to the user blogs)', {
          query: query,
          filter: filter,
          response: res2
        });
        response = { status: false, msg: 'Error in adding to user blogs' };
      }
      response = { status: true, blogId: blog._id.toHexString(), draftId: draft._id.toHexString() };
    } catch (e) {
      response = { status: false, err: e };
      return response;
    }
    const res3 = await User.deleteDraft(this._id.toHexString(), draftId, userCollection);
    if (!res3.status) {
      if (res3.err) {
        response = { status: false, err: res3.err };
      } else {
        response = { status: false, res: res3.res };
      }
      return response;
    }
    return response;
  }

  async deleteBlog (blogId, userCollection, blogCollection) {
    const res = await Blog.deleteBlogUsingId(blogId, blogCollection);
    if (!res.status) {
      return { status: false };
    }
    try {
      const filter = { _id: this._id };
      const update = { $pull: { blogs: ObjectId.createFromHexString(blogId) } };
      const res2 = await userCollection.updateOne(filter, update);
      if (res2.modifiedCount !== 1) {
        return { status: false };
      }
    } catch (e) {
      logger.error('Error in deleting blog from the user collection', { err: e });
      return { status: false };
    }
    return { status: true };
  }

  async addStar (blogId, userCollection, blogCollection) {
    try {
      const filter = { _id: this._id };
      const update = { $addToSet: { stars: ObjectId.createFromHexString(blogId) } };
      const res2 = await userCollection.updateOne(filter, update);
      if (res2.modifiedCount !== 1) {
        return { status: false };
      }
      const res = await Blog.updateStars(blogId, 'inc', blogCollection);
      if (!res.status) {
        return { status: false };
      }
    } catch (e) {
      logger.error('Error in adding stars from the user collection', { err: e });
      return { status: false };
    }
    return { status: true };
  }

  async removeStar (blogId, userCollection, blogCollection) {
    try {
      const filter = { _id: this._id };
      const update = { $pull: { stars: ObjectId.createFromHexString(blogId) } };
      const res2 = await userCollection.updateOne(filter, update);
      if (res2.modifiedCount !== 1) {
        return { status: false };
      }
      const res = await Blog.updateStars(blogId, 'dec', blogCollection);
      if (!res.status) {
        return { status: false };
      }
    } catch (e) {
      logger.error('Error in removing stars from the user collection', { err: e });
      return { status: false };
    }
    return { status: true };
  }

  static async getUser (userId, userCollection) {
    try {
      const filter = { _id: ObjectId.createFromHexString(userId) };
      const res = await userCollection.findOne(filter);
      if (res) {
        logger.debug(`read user: ${userId}`);
        return { status: true, user: res };
      }
      logger.debug(`No user found for userId:${userId}`);
      return { status: false, err: `No user found for userId:${userId}` };
    } catch (e) {
      logger.debug(`Error occurred while reading user:${userId}`, { err: e });
      return { status: false, err: e };
    }
  }

  /**
   *
   * @param {Comment} comment
   * @param id
   * @param userCollection
   * @param blogCollection
   * @param commentCollection
   * @returns {Promise<{status: boolean}>}
   */
  async addComment (comment, id, userCollection, blogCollection, commentCollection) {
    const res1 = await Comment.createComment(comment, id, blogCollection, commentCollection);
    if (!res1.status) {
      return { status: false };
    }
    const commentId = res1.commentId;
    try {
      const filter = { _id: this._id };
      const update = { $push: { replies: ObjectId.createFromHexString(commentId) } };
      const res2 = await userCollection.updateOne(filter, update);
      if (res2.modifiedCount !== 1) {
        return { status: false };
      }
    } catch (e) {
      logger.error(`Error in adding comment to user:${this._id.toHexString()} commentId:${commentId}`);
      return { status: false, commentId: res1.commentId };
    }
    return { status: true, commentId: res1.commentId };
  }

  async deleteComment (commentId, id, userCollection, blogCollection, commentCollection) {
    const res1 = await Comment.deleteComment(commentId, id, blogCollection, commentCollection);
    if (!res1.status) {
      return { status: false };
    }
    try {
      const filter = { _id: this._id };
      const update = { $push: { replies: ObjectId.createFromHexString(commentId) } };
      const res2 = await userCollection.updateOne(filter, update);
      if (res2.modifiedCount !== 1) {
        return { status: false };
      }
    } catch (e) {
      logger.error(`Error in deleting comment from user:${this._id.toHexString()} commentId:${commentId}`);
      return { status: false };
    }
    return { status: true };
  }
}

module.exports = User;
