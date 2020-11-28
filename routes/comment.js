const express = require('express');
const {
  getComment,
  getComments,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/comment');

const Comment = require('../models/Comment');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advanceResults');
const { protect, authorize } = require('../middleware/auth');
const Posts = require('../models/Posts');

router
  .route('/')
  .get(
    advancedResults(Posts, {
      path: 'posts',
      select: 'title description'
    }),
    getComments
  )
  .post(protect, authorize('user', 'admin'), addComment);

router
  .route('/:id')
  .get(getComment)
  .put(protect, authorize('user', 'admin'), updateComment)
  .delete(protect, authorize('user', 'admin'), deleteComment);

module.exports = router;