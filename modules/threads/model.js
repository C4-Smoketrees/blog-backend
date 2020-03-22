const bson = require('bson')
const app = require('../../app')
const logger = require('../../logging/logger')

/**
 * @typedef {{status:boolean,id:string|undefined}} DatabaseWriteResponse
 * @typedef {{status:boolean,thread:Thread|undefined}} DatabaseReadResponse
 */

/**
 * Class representing a thread
 */
class Thread {
  /**
   * Create an instance of thread
   * @param {{author: ObjectId, content: string}} thread Object representing the Thread
   * @param {Thread} thread Object representing a thread
   * @param {bson.ObjectID=auto_generate} [thread._id] Id for the object
   * @param {string} thread.content Content for the Thread
   * @param {array(Replies)=[]} [thread.replies] Replies array contains Replies
   * @param {array(Reports)=[]} [thread.reports] Reports array contains Reports
   * @param {number=time.now()} [thread.dateTime] Datetime
   * @param {array(bson.ObjectID)=[]} [thread.upvotes] Upvotes array
   * @param {array(bson.ObjectID)=[]} [thread.downvotes] Downvotes array
   * @param {bson.ObjectID} thread.author Author of the thread
   * @param {number=0} [thread.stars] Stars for the post
   */
  constructor (thread) {
    this._id = thread._id
    this.content = thread.content
    this.replies = thread.replies
    this.reports = thread.reports
    this.dateTime = thread.dateTime
    this.upvotes = thread.upvotes
    this.downvotes = thread.downvotes
    this.author = thread.author
    this.stars = thread.stars
  }

  /**
   * Creates a new thread in database
   * @returns {Promise} returns a promise
   */
  createThread () {
    const func = async () => {
      try {
        const threadCollection = app.locals.threadCollection
        // reference for thread is this
        this._id = new bson.ObjectID(bson.ObjectID.generate())
        this.replies = []
        this.reports = []
        this.dateTime = Date.now()
        this.upvotes = []
        this.downvotes = []
        this.stars = 0
        await threadCollection.insertOne(this)
        const response = {
          status: true,
          id: this._id.toHexString()
        }
        logger.debug(`Insert new thread with id:${response.id}`)
        return response
      } catch (e) {
        const response = { status: false, err: e }
        logger.debug(`Insert new thread with id:${response.id}`)
        return response
      }
    }
    return func()
  }

  /**
   * Update ThreadContent using _id property of the thread object
   * @returns {Promise} A promise that always resolves
   */
  updateThreadContent () {
    const threadCollection = app.locals.threadCollection

    const filter = { _id: this._id }
    const query = { $set: { content: this.content } }

    const func = async () => {
      try {
        const res = await threadCollection.updateOne(filter, query, {})
        let response
        if (res.modifiedCount === 1) {
          response = {
            status: true,
            id: this._id.toHexString()
          }
          logger.debug(`Updated content for thread for id: ${response.id}`)
        } else {
          response = { status: false, id: this._id.toHexString() }
          logger.error(JSON.stringify({ id: this._id.toHexString(), matches: res.matchedCount }))
        }
        return response
      } catch (e) {
        const response = { status: false }
        logger.error(`Error in updating thread for id: ${response.id}`)
        return response
      }
    }
    return func()
  }

  /**
   * Read and return a thread using id
   * @param {string} id HexString representing id of the thread
   * @returns {Promise}  Promise always resolves
   */
  static readThreadUsingId (id) {
    const threadCollection = app.locals.threadCollection
    const objectId = bson.ObjectID.createFromHexString(id)
    const filter = { _id: objectId }

    const func = async () => {
      try {
        const dbRes = await threadCollection.findOne(filter)
        const res = { status: true, thread: await dbRes }
        logger.debug(`Read thread with id: ${res.thread._id.toHexString()}`)
        return res
      } catch (e) {
        const res = { status: false }
        logger.error(JSON.stringify({ msg: `Error in reading the document with id : ${id}`, err: e }))
        return res
      }
    }
    return func()
  }

  /**
   * Delete a thread from the id
   * @param {string} id  HexString representing id of the thread
   * @returns {Promise} Always resolves
   */
  static deleteThreadUsingId (id) {
    const threadCollection = app.locals.threadCollection
    const objectId = bson.ObjectID.createFromHexString(id)
    const filter = { _id: objectId }
    const func = async () => {
      try {
        const res = await threadCollection.deleteOne(filter)
        let response
        if (res.deletedCount === 1) {
          response = { status: true, id: id }
          logger.debug(`Deleted thread id: ${id}`)
        } else {
          response = { status: false }
        }
        return response
      } catch (e) {
        const response = { status: false, err: e }
        logger.error(JSON.stringify({ msg: `Error in deleting the document with id : ${id}`, err: e }))
        return response
      }
    }
    return func()
  }
}

module.exports = Thread
