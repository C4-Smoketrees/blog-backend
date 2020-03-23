const { assert } = require('chai')
const { describe, beforeEach, it } = require('mocha')
const app = require('../app')
const Thread = require('../modules/threads/model')
const Report = require('../modules/reports/model')
const bson = require('bson')

describe('# Reports test-suite', function () {
  beforeEach(async function () {
    await app.locals.dbClient
    try {
      await app.locals.threadCollection.drop()
    } catch (e) {
    }
  })

  describe('# CRUD for reports', function () {
    it('Create a report', async function () {
      try {
        const thread = new Thread({ author: new bson.ObjectID(bson.ObjectID.generate()), content: 'report content' })
        const res1 = await thread.createThread(app.locals.threadCollection)
        assert.isTrue(res1.status)
        const report = new Report({
          reportReason: 1,
          userId: new bson.ObjectId(bson.ObjectID.generate())
        })
        const res2 = await Report.createReport(thread._id.toHexString(), report, app.locals.threadCollection)
        assert.isTrue(res2.status)
        const res3 = await Report.createReport(thread._id.toHexString(), report, app.locals.threadCollection)
        assert.isFalse(res3.status)
        thread._id = new bson.ObjectID(bson.ObjectID.generate())
        const res4 = await Report.createReport(thread._id.toHexString(), report, app.locals.threadCollection)
        assert.isFalse(res4.status)
      } catch (e) {
        console.log(e)
      }
    })
  })
})