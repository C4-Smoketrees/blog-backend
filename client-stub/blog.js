const fetch = require('node-fetch');
const agent = require('./agent');
const url = require('./url');

async function getOneBlog (blogId, token) {
  let auth = '';
  if (token) {
    auth = token;
  }
  const res = await fetch(`${url}/blogs/one?blogId=${blogId}`, {
    method: 'GET',
    headers: { Authorization: auth },
    agent
  });
  const body = res.json();
  return body;
}

async function getAllBlog (token) {
  let auth = '';
  if (token) {
    auth = token;
  }
  const res = await fetch(`${url}/blogs/all`, {
    method: 'GET',
    headers: { Authorization: auth },
    agent
  });
  const body = res.json();
  return body;
}

async function deleteBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/delete`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ _id: blogId }),
    agent
  });
  const body = res.json();
  return body;
}

async function updateBlog (blogId, blog, token) {
  const res = await fetch(`${url}/blogs/update`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      blog: {
        _id: blogId,
        content: blog.content,
        title: blog.title,
        tags: blog.tags
      }
    }),
    agent
  });
  const body = await res.json();
  return body;
}

async function upvoteBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/upvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function downvoteBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/downvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function removeUpvoteBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/removeUpvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function removeDownvoteBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/removeDownvote`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function starBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/star`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

async function unstarBlog (blogId, token) {
  const res = await fetch(`${url}/blogs/unstar`, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId: blogId }),
    agent
  });
  const body = await res.json();
  return body;
}

module.exports = {
  getOneBlog,
  getAllBlog,
  deleteBlog,
  updateBlog,
  upvoteBlog,
  downvoteBlog,
  removeUpvoteBlog,
  removeDownvoteBlog,
  starBlog,
  unstarBlog
};
