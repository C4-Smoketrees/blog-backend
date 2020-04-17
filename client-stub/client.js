const draft = require('./draft');
const comment = require('./comment');
const report = require('./report');
const thread = require('./thread');

const ForumClient = function () {
};

ForumClient.prototype.newDraft = draft.newDraft;
ForumClient.prototype.updateDraft = draft.updateDraft;
ForumClient.prototype.getOneDraft = draft.getOneDraft;
ForumClient.prototype.getAllDraft = draft.getAllDraft;
ForumClient.prototype.deleteDraft = draft.deleteDraft;
ForumClient.prototype.publishDraft = draft.publishDraft;

ForumClient.prototype.getComment = comment.getComment;
ForumClient.prototype.newComment = comment.newComment;
ForumClient.prototype.updateComment = comment.updateComment;
ForumClient.prototype.upvoteComment = comment.upvoteComment;
ForumClient.prototype.downvoteComment = comment.downvoteComment;
ForumClient.prototype.removeUpvoteComment = comment.removeUpvoteComment;
ForumClient.prototype.removeDownvoteComment = comment.removeDownvoteComment;

ForumClient.prototype.commentReport = report.commentReport;
ForumClient.prototype.threadReport = report.threadReport;

ForumClient.prototype.starThread = thread.starThread;
ForumClient.prototype.unstarThread = thread.unstarThread;
ForumClient.prototype.getOneThread = thread.getOneThread;
ForumClient.prototype.getAllThread = thread.getAllThread;
ForumClient.prototype.deleteThread = thread.deleteThread;
ForumClient.prototype.updateThread = thread.updateThread;
ForumClient.prototype.upvoteThread = thread.upvoteThread;
ForumClient.prototype.downvoteThread = thread.downvoteThread;
ForumClient.prototype.removeUpvoteThread = thread.removeUpvoteThread;
ForumClient.prototype.removeDownvoteThread = thread.removeDownvoteThread;

module.exports = new ForumClient();
