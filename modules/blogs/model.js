const bson = require('bson');
const logger = require('../../logging/logger');

/**
 * @typedef {{status:boolean,id:string|undefined}} DatabaseWriteResponse
 * @typedef {{status:boolean,blog:Blog|undefined}} DatabaseReadResponse
 */

/**
 * Class representing a blog
 */
class Blog {
  /**
   * Create an instance of blog
   * @param {{author: ObjectId, content: string,title:string}} blog Object representing the Blog
   * @param {Blog} blog Object representing a blog
   * @param {string} blog.title Blog's title
   * @param {bson.ObjectID=auto_generate} [blog._id] Id for the object
   * @param {string} blog.content Content for the Blog
   * @param {array(Replies)=[]} [blog.comments] Replies array contains Replies
   * @param {array(Reports)=[]} [blog.reports] Reports array contains Reports
   * @param {number=time.now()} [blog.dateTime] Datetime
   * @param {array(bson.ObjectID)=[]} [blog.upvotes] Upvotes array
   * @param {array(bson.ObjectID)=[]} [blog.downvotes] Downvotes array
   * @param {bson.ObjectID} blog.author Author of the blog
   * @param {number=0} [blog.stars] Stars for the post
   * @param {number=time.now()} blog.astUpdate Last updated
   */
  constructor (blog) {
    this._id = blog._id;
    this.content = blog.content;
    this.title = blog.title;
    this.replies = blog.replies;
    this.reports = blog.reports;
    this.dateTime = blog.dateTime;
    this.upvotesCount = blog.upvotesCount;
    this.downvotesCount = blog.downvotesCount;
    this.upvotes = blog.upvotes;
    this.downvotes = blog.downvotes;
    this.author = blog.author;
    this.stars = blog.stars;
    this.lastUpdate = blog.lastUpdate;
    this.tags = blog.tags;
  }

  /**
   * Creates a new blog in database
   * @param {Collection} blogCollection
   * @param {Blog} blog
   * @returns {Promise} returns a promise
   */
  static createBlog (blog, blogCollection) {
    const func = async () => {
      try {
        blog._id = new bson.ObjectID(bson.ObjectID.generate());
        blog.replies = [];
        blog.reports = [];
        blog.dateTime = Date.now();
        blog.upvotes = [];
        blog.downvotes = [];
        blog.upvotesCount = 0;
        blog.downvotesCount = 0;
        blog.stars = 0;
        blog.lastUpdate = Date.now();
        await blogCollection.insertOne(blog);
        const response = {
          status: true,
          blogId: blog._id.toHexString()
        };
        logger.debug(`Insert new blog with id:${response.blogId}`);
        return response;
      } catch (e) {
        const response = { status: false, err: e };
        logger.error('Error creating new blog', { err: e });
        return response;
      }
    };
    return func();
  }

  /**
   * Update BlogContent using _id property of the blog object
   * @param blog
   * @param userId
   * @param {Collection} blogCollection
   * @returns {Promise} A promise that always resolves
   */
  static updateBlogContent (blog, userId, blogCollection) {
    const filter = { _id: blog._id, author: bson.ObjectID.createFromHexString(userId) };
    blog.lastUpdate = Date.now();
    const query = {
      $set: {
        title: blog.title,
        content: blog.content,
        tags: blog.tags
      }
    };

    const func = async () => {
      try {
        const res = await blogCollection.updateOne(filter, query, {});
        let response;
        if (res.modifiedCount === 1) {
          response = {
            status: true,
            blogId: blog._id.toHexString()
          };
          logger.debug(`Updated content for blog with id: ${response.blogId}`);
        } else {
          response = { status: false, id: blog._id.toHexString() };
          logger.error(JSON.stringify({ id: blog._id.toHexString(), matches: res.matchedCount }));
        }
        return response;
      } catch (e) {
        const response = { status: false };
        logger.error(`Error in updating blog with id: ${blog._id}`);
        return response;
      }
    };
    return func();
  }

  /**
   * Read and return a blog using id
   * @param {string} id HexString representing id of the blog
   * @param {Collection} blogCollection
   * @param {string} [userId]
   * @returns {Promise}  Promise always resolves
   */
  static readBlogUsingId (id, blogCollection, userId) {
    const objectId = bson.ObjectID.createFromHexString(id);
    const filter = { _id: objectId };
    let projection;
    if (userId) {
      projection = {
        _id: 1,
        content: 1,
        title: 1,
        tags: 1,
        replies: 1,
        reports: 1,
        dateTime: 1,
        upvotesCount: 1,
        downvotesCount: 1,
        stars: 1,
        lastUpdate: 1,
        upvotes: { $elemMatch: { $eq: bson.ObjectID.createFromHexString(userId) } },
        downvotes: { $elemMatch: { $eq: bson.ObjectID.createFromHexString(userId) } }
      };
    } else {
      projection = {
        _id: 1,
        content: 1,
        title: 1,
        tags: 1,
        replies: 1,
        reports: 1,
        dateTime: 1,
        upvotesCount: 1,
        downvotesCount: 1,
        stars: 1,
        lastUpdate: 1
      };
    }
    const func = async () => {
      try {
        const dbRes = await blogCollection.findOne(filter, { projection: projection });
        const res = { status: true, blog: await dbRes };
        logger.debug(`Read blog with id: ${res.blog._id.toHexString()}`);
        return res;
      } catch (e) {
        const res = { status: false };
        logger.error(JSON.stringify({ msg: `Error in reading the document with id : ${id}`, err: e }));
        return res;
      }
    };
    return func();
  }

  static async readAllBlogs (blogCollection, userId) {
    let projection;
    if (userId) {
      projection = {
        _id: 1,
        content: 1,
        title: 1,
        tags: 1,
        replies: 1,
        reports: 1,
        dateTime: 1,
        upvotesCount: 1,
        downvotesCount: 1,
        stars: 1,
        lastUpdate: 1,
        upvotes: { $elemMatch: { $eq: bson.ObjectID.createFromHexString(userId) } },
        downvotes: { $elemMatch: { $eq: bson.ObjectID.createFromHexString(userId) } }
      };
    } else {
      projection = {
        _id: 1,
        content: 1,
        title: 1,
        tags: 1,
        replies: 1,
        reports: 1,
        dateTime: 1,
        upvotesCount: 1,
        downvotesCount: 1,
        stars: 1,
        lastUpdate: 1
      };
    }
    try {
      let doc;
      const blogs = [];
      let length = 0;
      const res = await blogCollection.find({}, { projection: projection });
      while (await res.hasNext()) {
        doc = await res.next();
        blogs.push(doc);
        length += 1;
      }
      return { status: true, blogs: blogs, length: length };
    } catch (e) {
      const res = { status: false };
      logger.error(JSON.stringify({ msg: 'Error in reading all blogs', err: e }));
      return res;
    }
  }

  /**
   * Delete a blog with the id
   * @param {string} id  HexString representing id of the blog
   * @param {Collection} blogCollection
   * @returns {Promise} Always resolves
   */
  static deleteBlogUsingId (id, blogCollection) {
    const objectId = bson.ObjectID.createFromHexString(id);
    const filter = { _id: objectId };
    const func = async () => {
      try {
        const res = await blogCollection.deleteOne(filter);
        let response;
        if (res.deletedCount === 1) {
          response = { status: true, blogId: id };
          logger.debug(`Deleted blog id: ${id}`);
        } else {
          response = { status: false };
        }
        return response;
      } catch (e) {
        const response = { status: false, err: e };
        logger.error(JSON.stringify({ msg: `Error in deleting the document of id : ${id}`, err: e }));
        return response;
      }
    };
    return func();
  }

  static async readAllTags (tagCollection) {
    try {
      const res = await tagCollection.findOne({});
      if (!res) {
        return { status: false };
      }
      const tags = res.tags;
      return { status: true, tags: tags };
    } catch (e) {
      logger.error('Error in reading the tags', { err: e });
      return { status: false, err: e };
    }
  }

  /**
   * Increment or Decrement stars of the blog
   * @param {string} id HexString representing the id
   * @param {string} command Either inc or dec
   * @param {Collection} blogCollection
   * @returns {Promise<DatabaseWriteResponse>} Promise always resolves
   */
  static updateStars (id, command, blogCollection) {
    const objectId = new bson.ObjectID(bson.ObjectID.createFromHexString(id));

    const filter = { _id: objectId };
    let query;
    if (command === 'inc') {
      query = { $inc: { stars: 1 } };
    } else if (command === 'dec') {
      query = { $inc: { stars: -1 } };
    } else {
      throw new Error('Illegal Command');
    }

    const func = async () => {
      try {
        const result = await blogCollection.updateOne(filter, query);
        let response;
        if (result.modifiedCount === 1) {
          response = { status: true, blogId: id };
          logger.debug(`Incremented star for the id: ${id}`);
        } else {
          response = { status: false, blogId: id };
          logger.warn(`Error in incrementing star for id: ${id} modified:${result.modifiedCount} match: ${result.matchedCount}`);
        }
        return response;
      } catch (e) {
        const response = { status: false, err: e };
        logger.error(JSON.stringify({ msg: `Error in incrementing start for id : ${id}`, err: e }));
        return response;
      }
    };

    return func();
  }

  static async readBlogByTag (tag, blogCollection) {
    try {
      const filter = { tags: tag };
      const res = await blogCollection.find(filter);
      const blogs = [];
      let doc;
      while (await res.hasNext()) {
        doc = await res.next();
        blogs.push(doc);
      }
      return { status: true, blogs: blogs };
    } catch (e) {
      const res = { status: false, err: e };
      logger.error(JSON.stringify({ msg: 'Error in reading all blogs', err: e }));
      return res;
    }
  }

  static async addUpvote (blogId, userId, blogCollection) {
    const filter = { _id: bson.ObjectID.createFromHexString(blogId) };
    let query = { $addToSet: { upvotes: bson.ObjectID.createFromHexString(userId) } };

    let response;
    try {
      const res = await blogCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        query = { $inc: { upvotesCount: 1 } };
        await blogCollection.updateOne(filter, query);
        response = {
          status: true
        };
      } else {
        response = {
          status: false
        };
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      };
      logger.error(`Error in upvoting blog: ${blogId} error:${e.message}`);
    }
    return response;
  }

  static async addDownvote (blogId, userId, blogCollection) {
    const filter = { _id: bson.ObjectID.createFromHexString(blogId) };
    let query = { $addToSet: { downvotes: bson.ObjectID.createFromHexString(userId) } };

    let response;
    try {
      const res = await blogCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        query = { $inc: { downvotesCount: 1 } };
        await blogCollection.updateOne(filter, query);
        response = {
          status: true
        };
      } else {
        response = {
          status: false
        };
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      };
      logger.error(`Error in upvoting blog: ${blogId} error:${e.message}`);
    }
    return response;
  }

  static async removeDownvote (blogId, userId, blogCollection) {
    const filter = { _id: bson.ObjectID.createFromHexString(blogId) };
    let query = { $pull: { downvotes: bson.ObjectID.createFromHexString(userId) } };

    let response;
    try {
      const res = await blogCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        query = { $inc: { downvotesCount: -1 } };
        await blogCollection.updateOne(filter, query);
        response = {
          status: true
        };
      } else {
        response = {
          status: false
        };
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      };
      logger.error(`Error in removing downvote: ${blogId} error:${e.message}`);
    }
    return response;
  }

  static async removeUpvote (blogId, userId, blogCollection) {
    const filter = { _id: bson.ObjectID.createFromHexString(blogId) };
    let query = { $pull: { upvotes: bson.ObjectID.createFromHexString(userId) } };

    let response;
    try {
      const res = await blogCollection.updateOne(filter, query);
      if (res.modifiedCount === 1) {
        query = { $inc: { upvotesCount: -1 } };
        await blogCollection.updateOne(filter, query);
        response = {
          status: true
        };
      } else {
        response = {
          status: false
        };
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      };
      logger.error(`Error in removing upvote: ${blogId} error:${e.message}`);
    }
    return response;
  }
}

module.exports = Blog;
