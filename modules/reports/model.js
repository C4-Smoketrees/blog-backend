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
   * @param {string} threadId
   * @param {Report} report
   * @param {Collection} threadCollection
   * @return {Promise<DatabaseReportWriteResponse>}
   */
  static async createReport (threadId, report, threadCollection) {
    const func = async () => {
      try {
        let response;
        const threadObjectId = bson.ObjectId.createFromHexString(threadId);
        let filter = { _id: threadObjectId, 'reports.userId': report.userId };
        const thread = await threadCollection.findOne(filter);
        if (thread == null) {
          filter = { _id: threadObjectId };
          report._id = new bson.ObjectID(bson.ObjectID.generate());
          const query = { $push: { reports: report } };
          const res = await threadCollection.updateOne(filter, query);
          if (res.modifiedCount === 1) {
            response = { status: true, reportId: report._id.toHexString(), msg: 'success' };
            logger.debug(`Reported report_id:${report._id.toHexString()}`);
          } else {
            logger.warn(`Unable to report threadId:${threadId} userId:${report.userId.toHexString()}`);
            response = { status: false, err: `matched:${res.matchedCount} modified:${res.modifiedCount}` };
          }
        } else {
          response = { status: false, err: 'already reported' };
          logger.debug(`Already reported thread_id:${threadId} user_id:${report.userId.toHexString()}`);
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

  static async createReplyReport (replyId, report, replyCollection) {
    try {
      let response;
      const replyObjectId = bson.ObjectID.createFromHexString(replyId);
      let filter = {
        _id: replyObjectId,
        'reports.userId': report.userId
      };
      const reply = await replyCollection.findOne(filter);
      if (reply == null) {
        filter = {
          _id: replyObjectId
        };
        report._id = new bson.ObjectID(bson.ObjectID.generate());
        const query = { $push: { reports: report } };
        const res = await replyCollection.updateOne(filter, query);
        if (res.modifiedCount === 1) {
          response = { status: true, reportId: report._id.toHexString(), msg: 'success' };
          logger.debug(`Reported report_id:${report._id.toHexString()}`);
        } else {
          logger.warn(`Unable to report replyId:${replyId} userId:${report.userId.toHexString()}`);
          response = { status: false, err: `matched:${res.matchedCount} modified:${res.modifiedCount}` };
        }
      } else {
        response = { status: false, err: 'already reported' };
        logger.debug(`Already reported replyId:${replyId}  user_id:${report.userId.toHexString()}`);
      }
      return response;
    } catch (e) {
      const response = { status: false, err: e.message };
      logger.error(`Error in creating report for the user and reply:${replyId}`);
      return response;
    }
  }
}

module.exports = Report;
