const bson = require('bson');
const logger = require('../../logging/logger');

class Report {
  /**
   * Returns a Report Object
   * @param {{userId: ObjectId, reportReason: number}|Report} object
   */
  constructor (object) {
    this._id = object._id;
    this.userId = object.userId;
    this.reportReason = object.reportReason;
    this.description = object.description;
  }

  /**
   * @typedef {Object} DatabaseReportWriteResponse
   * @param {boolean} DatabaseReportWriteResponse.status
   * @param {string|undefined} DatabaseReportWriteResponse.reportId
   * @param {string|undefined} DatabaseReportWriteResponse.err
   */

  /**
   * Create Report for a post
   * @param {string} blogId
   * @param {Report} report
   * @param {Collection} blogCollection
   * @return {Promise<DatabaseReportWriteResponse>}
   */
  static async createReport (blogId, report, blogCollection) {
    const func = async () => {
      try {
        let response;
        const blogObjectId = bson.ObjectId.createFromHexString(blogId);
        let filter = { _id: blogObjectId, 'reports.userId': report.userId };
        const blog = await blogCollection.findOne(filter);
        if (blog == null) {
          filter = { _id: blogObjectId };
          report._id = new bson.ObjectID(bson.ObjectID.generate());
          const query = { $push: { reports: report } };
          const res = await blogCollection.updateOne(filter, query);
          if (res.modifiedCount === 1) {
            response = { status: true, reportId: report._id.toHexString(), msg: 'success' };
            logger.debug(`Reported report_id:${report._id.toHexString()}`);
          } else {
            logger.warn(`Unable to report blogId:${blogId} userId:${report.userId.toHexString()}`);
            response = { status: false, err: `matched:${res.matchedCount} modified:${res.modifiedCount}` };
          }
        } else {
          response = { status: false, err: 'already reported' };
          logger.debug(`Already reported blog_id:${blogId} user_id:${report.userId.toHexString()}`);
        }
        return response;
      } catch (e) {
        const response = { status: false, err: e.message };
        logger.error('Error in creating report for the users');
        return response;
      }
    };
    return func();
  }

  static async createCommentReport (commentId, report, commentCollection) {
    try {
      let response;
      const commentObjectId = bson.ObjectID.createFromHexString(commentId);
      let filter = {
        _id: commentObjectId,
        'reports.userId': report.userId
      };
      const comment = await commentCollection.findOne(filter);
      if (comment == null) {
        filter = {
          _id: commentObjectId
        };
        report._id = new bson.ObjectID(bson.ObjectID.generate());
        const query = { $push: { reports: report } };
        const res = await commentCollection.updateOne(filter, query);
        if (res.modifiedCount === 1) {
          response = { status: true, reportId: report._id.toHexString(), msg: 'success' };
          logger.debug(`Reported report_id:${report._id.toHexString()}`);
        } else {
          logger.warn(`Unable to report commentId:${commentId} userId:${report.userId.toHexString()}`);
          response = { status: false, err: `matched:${res.matchedCount} modified:${res.modifiedCount}` };
        }
      } else {
        response = { status: false, err: 'already reported' };
        logger.debug(`Already reported commentId:${commentId}  user_id:${report.userId.toHexString()}`);
      }
      return response;
    } catch (e) {
      const response = { status: false, err: e.message };
      logger.error(`Error in creating report for the user and comment:${commentId}`);
      return response;
    }
  }
}

module.exports = Report;
