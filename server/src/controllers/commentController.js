import logger from '../utils/logger.js';
import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import ResponseError from '../utils/responseError.js';
import validate from '../utils/validate.js';
import {
  createCommentSchema,
  updateCommentSchema,
  getCommentSchema,
  searchCommentSchema,
} from '../validations/commentValidation.js';
import { getPostSchema } from '../validations/postValidation.js';
import checkOwnership from '../utils/checkOwnership.js';
import formatMongoDoc from '../utils/formatMongoDoc.js';

const validatePostId = async id => {
  const postId = validate(getPostSchema, id);

  const post = await Post.findById(postId);
  if (!post) throw new ResponseError('Post not found', 404);

  return postId;
};

const create = async (req, res) => {
  const postId = await validatePostId(req.params.postId);
  const fields = validate(createCommentSchema, req.body);

  await Comment.create({
    ...fields,
    post: postId,
    user: req.user.id,
  });

  logger.info('comment created successfully');
  res.status(201).json({
    code: 201,
    message: 'Comment created successfully',
  });
};

const listByPost = async (req, res) => {
  const postId = await validatePostId(req.params.postId);
  const comments = await Comment.find({ post: postId }).populate({
    path: 'user',
    select: 'username email avatar',
  });

  if (comments.length === 0) {
    logger.info('no comments found');
    return res.status(200).json({
      code: 200,
      message: 'No comments found',
      data: [],
    });
  }

  logger.info('comments retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Comments retrieved successfully',
    data: comments,
  });
};

const search = async (req, res) => {
  const query = validate(searchCommentSchema, req.query);
  const { page, limit, q, sortBy, sortOrder } = query;

  const [{ comments, totalComments }] = await Comment.aggregate()
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
      pipeline: [{ $project: { username: 1 } }],
    })
    .lookup({
      from: 'posts',
      localField: 'post',
      foreignField: '_id',
      as: 'post',
      pipeline: [{ $project: { title: 1 } }],
    })
    .unwind('user')
    .unwind('post')
    .match(
      q
        ? {
            $or: [
              { text: { $regex: q, $options: 'i' } },
              { 'user.username': { $regex: q, $options: 'i' } },
              { 'post.title': { $regex: q, $options: 'i' } },
            ],
          }
        : {}
    )
    .facet({
      comments: [
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalComments: [{ $count: 'count' }],
    })
    .project({
      comments: 1,
      totalComments: {
        $ifNull: [{ $arrayElemAt: ['$totalComments.count', 0] }, 0],
      },
    });

  if (comments.length === 0) {
    logger.info('no comments found');
    return res.status(200).json({
      code: 200,
      message: 'No comments found',
      data: [],
      meta: {
        pageSize: limit,
        totalItems: 0,
        currentPage: page,
        totalPages: 1,
      },
    });
  }

  const formattedComments = comments.map(comment =>
    formatMongoDoc(comment, true)
  );

  res.status(200).json({
    code: 200,
    message: 'Comments retrieved successfully',
    data: formattedComments,
    meta: {
      pageSize: limit,
      totalItems: totalComments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
    },
  });
};

const show = async (req, res) => {
  await validatePostId(req.params.postId);
  const commentId = validate(getCommentSchema, req.params.commentId);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ResponseError('Comment not found', 404);

  logger.info('comment retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Comment retrieved successfully',
    data: comment,
  });
};

const update = async (req, res) => {
  await validatePostId(req.params.postId);
  const commentId = validate(getCommentSchema, req.params.commentId);
  const fields = validate(updateCommentSchema, req.body);

  const comment = await Comment.findByIdAndUpdate(commentId, fields, {
    new: true,
  });
  if (!comment) throw new ResponseError('Comment not found', 404);

  logger.info('comment updated successfully');
  res.status(200).json({
    code: 200,
    message: 'Comment updated successfully',
    data: comment,
  });
};

const remove = async (req, res) => {
  await validatePostId(req.params.postId);
  const commentId = validate(getCommentSchema, req.params.commentId);

  await checkOwnership({
    modelName: 'comment',
    paramsId: commentId,
    ownerFieldName: 'user',
    currentUser: req.user,
  });

  await Comment.deleteMany({ parentCommentId: commentId });

  const comment = await Comment.findByIdAndDelete(commentId);
  if (!comment) throw new ResponseError('Comment not found', 404);

  logger.info('comment deleted successfully');
  res.status(200).json({
    code: 200,
    message: 'Comment deleted successfully',
    data: comment,
  });
};

export default { create, show, update, remove, search, listByPost };
