const draft = require('./draft');
const comment = require('./comment');
const report = require('./report');
const blog = require('./blog');

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
ForumClient.prototype.blogReport = report.blogReport;

ForumClient.prototype.starBlog = blog.starBlog;
ForumClient.prototype.unstarBlog = blog.unstarBlog;
ForumClient.prototype.getOneBlog = blog.getOneBlog;
ForumClient.prototype.getAllBlog = blog.getAllBlog;
ForumClient.prototype.deleteBlog = blog.deleteBlog;
ForumClient.prototype.updateBlog = blog.updateBlog;
ForumClient.prototype.upvoteBlog = blog.upvoteBlog;
ForumClient.prototype.downvoteBlog = blog.downvoteBlog;
ForumClient.prototype.removeUpvoteBlog = blog.removeUpvoteBlog;
ForumClient.prototype.removeDownvoteBlog = blog.removeDownvoteBlog;

module.exports = new ForumClient();
