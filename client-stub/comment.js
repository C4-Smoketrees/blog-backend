const fetch = require('node-fetch');
const agent = require('./agent');
const url = require('./url');

async function newComment (id, comment, token) {
  const res = await fetch(`${url}/comments`, {
    method: 'POST',
    body: JSON.stringify({ id: id, comment: comment }),
    headers: { 'Content-Type': 'application/json', Authorization: token },
    agent
  });
  const body = await res.json();
  return body;
}

async function getComment (commentId, token) {
  let auth = '';
  if (token) {
    auth = token;
  }
  const res = await fetch(`${url}/comments?commentId=${commentId}`, {
    method: 'GET',
    headers: { Authorization: auth },
    agent
  });
  const body = await res.json();
  return body;
}

async function updateComment (commentId, content, token) {
  const res = await fetch(`${url}/comments/update`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment: { _id: commentId, content: content } }),
    agent
  });
  const body = await res.json();
  return body;
}

async function upvoteComment (commentId, token) {
  const res = await fetch(`${url}/comments/upvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId: commentId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function downvoteComment (commentId, token) {
  const res = await fetch(`${url}/comments/downvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId: commentId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function removeUpvoteComment (commentId, token) {
  const res = await fetch(`${url}/comments/removeUpvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId: commentId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function removeDownvoteComment (commentId, token) {
  const res = await fetch(`${url}/comments/removeDownvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ commentId: commentId }),
    agent
  });
  const body = await res.json();
  return body;
}

exports.newComment = newComment;
exports.getComment = getComment;
exports.updateComment = updateComment;
exports.upvoteComment = upvoteComment;
exports.downvoteComment = downvoteComment;
exports.removeUpvoteComment = removeUpvoteComment;
exports.removeDownvoteComment = removeDownvoteComment;
