const bson = require('bson')
const logger = require('../../logging/logger')

class Comment {
  constructor (object) {
    this._id = object._id
    this.content = object.content
    this.author = object.author
    this.upvotes = object.upvotes
    this.downvotes = object.downvotes
    this.dateTime = object.dateTime
    this.lastUpdate = object.lastUpdate
    this.upvotesCount = object.upvotesCount
    this.downvotesCount = object.downvotesCount
    this.replies = object.replies
    this.reports = object.reports
  }

  static async createComment (comment, id, blogCollection, commentCollection) {
    let response
    comment.upvotes = []
    comment.downvotes = []
    comment.upvotesCount = 0
    comment.downvotesCount = 0
    comment.reports = []
    comment.replies = []
    comment.blogId = id.blogId

    let filter

    try {
      comment._id = new bson.ObjectID(bson.ObjectId.generate())
      comment.dateTime = Date.now()
      comment.lastUpdate = Date.now()
      const query = {
        $push: {
          replies: comment._id
        }
      }
      let res
      if (id.commentId) {
        filter = { _id: bson.ObjectID.createFromHexString(id.commentId) }
        res = await commentCollection.updateOne(filter, query)
      } else if (id.blogId) {
        filter = { _id: bson.ObjectID.createFromHexString(id.blogId) }
        res = await blogCollection.updateOne(filter, query)
      } else {
        return { status: false, msg: 'blogId or commentId missing' }
      }
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to create a comment for blog:${id.blogId} comment:${id.comment.blogId} commentId:${comment._id}`
        }
        logger.debug(response.msg)
      } else {
        res = await commentCollection.insertOne(comment)
        response = {
          status: true,
          msg: 'success',
          commentId: comment._id.toHexString()
        }
        logger.debug(`New comment for blog:${id.blogId}  comment:${id.commentId} commentId:${comment._id}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`error comment for blog:${id.blogId}  comment:${id.commentId} commentId:${comment._id}`, e)
    }
    return response
  }

  static async updateCommentContent (comment, userId, commentCollection) {
    let response
    try {
      comment.author = bson.ObjectID.createFromHexString(userId)
      const filter = {
        _id: comment._id,
        author: comment.author
      }
      const res = await commentCollection.updateOne(filter, { $set: comment })
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to update content for comment a comment for commentId:${comment._id}`
        }
        logger.debug(response.msg)
      } else {
        response = {
          status: true,
          msg: 'success',
          commentId: comment._id.toHexString()
        }
        logger.debug(`Updated comment for commentId:${comment._id}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable to update comment for commentId:${comment._id}`)
    }
    return response
  }

  static async deleteComment (commentId, id, blogCollection, commentCollection) {
    let response
    try {
      let filter
      let res

      const query = {
        $pull: { replies: bson.ObjectID.createFromHexString(commentId) }
      }
      if (id.blogId) {
        filter = { _id: bson.ObjectID.createFromHexString(id.blogId) }
        res = await blogCollection.updateOne(filter, query)
      } else if (id.commentId) {
        filter = { _id: bson.ObjectID.createFromHexString(id.commentId) }
        res = await commentCollection.updateOne(filter, query)
      } else {
        return { status: false, msg: 'blogId or commentId missing' }
      }
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to delete comment blog:${id.blogId} comment:${id.commentId} commentId:${commentId}`
        }
        logger.debug(response.msg)
      } else {
        await commentCollection.deleteOne({ _id: bson.ObjectID.createFromHexString(commentId) })
        response = {
          status: true,
          msg: 'success',
          commentId: commentId
        }
        logger.debug(`deleted comment for blog:${id.blogId} comment:${id.commentId} commentId:${commentId}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable to delete comment for blog:${id.blogId} comment:${id.commentId}`, e)
    }
    return response
  }

  static async readComment (commentId, commentCollection, userId) {
    try {
      const filter = {
        _id: bson.ObjectID.createFromHexString(commentId)
      }

      let projection
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
        }
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
        }
      }
      const comment = await commentCollection.findOne(filter, { projection: projection })
      if (comment) {
        return { status: true, comment: comment }
      } else {
        logger.debug(`no user found for user:${commentId}`)
        return { status: false }
      }
    } catch (e) {
      logger.debug(`error in finding user:${commentId}`, e)
      return { status: false, err: e }
    }
  }

  static async addCommentUpvote (commentId, userId, commentCollection) {
    const filter = {
      _id: bson.ObjectID.createFromHexString(commentId)
    }
    const query = {
      $addToSet: { upvotes: bson.ObjectID.createFromHexString(userId) },
      $inc: { upvotesCount: 1 }
    }
    let response
    try {
      const res = await commentCollection.updateOne(filter, query)
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to add upvote for comment commentId:${commentId}`
        }
        logger.debug(response.msg)
      } else {
        response = {
          status: true,
          msg: 'success',
          commentId: commentId
        }
        logger.debug(`Added upvote for comment for commentId:${commentId}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable add upvote for comment for commentId:${commentId}`)
    }
    return response
  }

  static async addCommentDownvote (commentId, userId, commentCollection) {
    const filter = {
      _id: bson.ObjectID.createFromHexString(commentId)
    }
    const query = {
      $addToSet: { downvotes: bson.ObjectID.createFromHexString(userId) },
      $inc: { downvotesCount: 1 }
    }
    let response
    try {
      const res = await commentCollection.updateOne(filter, query)
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to add downvote for comment commentId:${commentId}`
        }
        logger.debug(response.msg)
      } else {
        response = {
          status: true,
          msg: 'success',
          commentId: commentId
        }
        logger.debug(`Added downvote for comment for commentId:${commentId}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable add downvote for comment for commentId:${commentId}`)
    }
    return response
  }

  static async removeCommentUpvote (commentId, userId, commentCollection) {
    const user = bson.ObjectID.createFromHexString(userId)
    const filter = {
      _id: bson.ObjectID.createFromHexString(commentId),
      upvotes: user
    }

    const query = {
      $pull: { upvotes: user },
      $inc: { upvotesCount: -1 }
    }
    let response
    try {
      const res = await commentCollection.updateOne(filter, query)
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to remove upvote for comment commentId:${commentId}`
        }
        logger.debug(response.msg)
      } else {
        response = {
          status: true,
          msg: 'success',
          commentId: commentId
        }
        logger.debug(`remove upvote for comment for commentId:${commentId}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable to remove upvote for comment for commentId:${commentId}`)
    }
    return response
  }

  static async removeCommentDownvote (commentId, userId, commentCollection) {
    const user = bson.ObjectID.createFromHexString(userId)
    const filter = {
      _id: bson.ObjectID.createFromHexString(commentId),
      downvotes: user
    }
    const query = {
      $pull: { downvotes: user },
      $inc: { downvotesCount: -1 }
    }
    let response
    try {
      const res = await commentCollection.updateOne(filter, query)
      if (res.modifiedCount !== 1) {
        response = {
          status: false,
          msg: `Unable to remove downvote for comment commentId:${commentId}`
        }
        logger.debug(response.msg)
      } else {
        response = {
          status: true,
          msg: 'success',
          commentId: commentId
        }
        logger.debug(`remove downvote for comment for commentId:${commentId}`)
      }
    } catch (e) {
      response = {
        status: false,
        err: e
      }
      logger.error(`Unable remove downvote for comment for commentId:${commentId}`)
    }
    return response
  }
}

module.exports = Comment
