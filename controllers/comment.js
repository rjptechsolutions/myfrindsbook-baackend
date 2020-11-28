const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../models/Comment');
const Posts = require('../models/Posts');

// @desc      Get comment
// @route     GET /api/v1/comment
// @route     GET /api/v1/Posts/:postId/comment
// @access    Public
exports.getComments = asyncHandler(async (req, res, next) => {
  if (req.params.postId) {
    const comment = await Comment.find({ posts: req.params.postId });

    return res.status(200).json({
      success: true,
      count: comment.length,
      data: comment
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/comment/:id
// @access    Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate({
    path: 'posts',
    select: 'name description'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Add comment
// @route     POST /api/v1/Posts/:postId/comment
// @access    Private
exports.addComment = asyncHandler(async (req, res, next) => {
  req.body.posts = req.params.postId;
  req.body.user = req.user.id;

  const posts = await Posts.findById(req.params.postId);

  if (!posts) {
    return next(
      new ErrorResponse(
        `No posts with the id of ${req.params.postId}`,
        404
      )
    );
  }

  const comment = await comment.create(req.body);

  res.status(201).json({
    success: true,
    data: comment
  });
});

// @desc      Update comment
// @route     PUT /api/v1/comment/:id
// @access    Private
exports.updateComment = asyncHandler(async (req, res, next) => {
  let comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure comment belongs to user or user is admin
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update comment`, 401));
  }

  comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  comment.save();

  res.status(200).json({
    success: true,
    data: comment
  });
});

// @desc      Delete comment
// @route     DELETE /api/v1/comment/:id
// @access    Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`No comment with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure comment belongs to user or user is admin
  if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update comment`, 401));
  }

  await comment.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});