import Post from '../models/postModel.js';
import Category from '../models/categoryModel.js';
import slugify from 'slugify';
import ResponseError from '../utils/responseError.js';
import uploadFile from '../utils/uploadFile.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';
import {
  createPostSchema,
  updatePostSchema,
  getPostSchema,
  searchPostSchema,
} from '../validations/postValidation.js';
import mongoose from 'mongoose';
import cloudinary from '../utils/cloudinary.js';
import extractPublicId from '../utils/extractPublicId.js';
import formatMongoDoc from '../utils/formatMongoDoc.js';

const create = async (req, res) => {
  const { files, fields } = await uploadFile(req, {
    isRequired: true,
    fieldname: 'image',
    folderName: 'posts',
    formSchema: createPostSchema,
  });

  fields.slug = slugify(fields.title, { lower: true });

  if (files && files.length > 0) fields.image = files[0].secure_url;

  if (fields.category) {
    const category = await Category.exists({ _id: fields.category });
    if (!category) {
      if (files && files.length > 0) {
        await cloudinary.uploader.destroy(extractPublicId(files[0].secure_url));
      }
      throw new ResponseError('Validation errors', 400, {
        category: 'Invalid category id',
      });
    }
  }

  await Post.create({ ...fields, user: req.user.id });

  logger.info('post created successfully');
  res.status(201).json({
    code: 201,
    message: 'Post created successfully',
  });
};

const search = async (req, res) => {
  const query = validate(searchPostSchema, req.query);
  const { page, limit, q, category, sortBy, sortOrder } = query;

  const matchConditions = [];

  if (q) {
    matchConditions.push({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { 'user.username': { $regex: q, $options: 'i' } },
        { 'user.email': { $regex: q, $options: 'i' } },
        { 'category.name': { $regex: q, $options: 'i' } },
      ],
    });
  }

  if (category && mongoose.Types.ObjectId.isValid(category)) {
    matchConditions.push({
      'category._id': new mongoose.Types.ObjectId(category),
    });
  }

  const [{ posts, totalPosts }] = await Post.aggregate()
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
      pipeline: [{ $project: { username: 1, email: 1, avatar: 1 } }],
    })
    .lookup({
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'category',
    })
    .unwind('user')
    .unwind('category')
    .match(matchConditions.length ? { $and: matchConditions } : {})
    .project({ likes: 0 })
    .facet({
      posts: [
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalPosts: [{ $count: 'count' }],
    })
    .project({
      posts: 1,
      totalPosts: {
        $ifNull: [{ $arrayElemAt: ['$totalPosts.count', 0] }, 0],
      },
    });

  if (posts.length === 0) {
    return res.status(200).json({
      code: 200,
      message: 'No posts found',
      data: [],
      meta: {
        pageSize: limit,
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      },
    });
  }

  const formattedPosts = posts.map(post => formatMongoDoc(post, true));

  res.status(200).json({
    code: 200,
    message: 'Posts retrieved successfully',
    data: formattedPosts,
    meta: {
      pageSize: limit,
      totalItems: totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    },
  });
};

const show = async (req, res) => {
  const postId = validate(getPostSchema, req.params.postId);

  const post = await Post.findById(postId)
    .populate('user', 'username avatar')
    .populate('category', 'name');

  if (!post) throw new ResponseError('Post not found', 404);

  logger.info('post retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Post retrieved successfully',
    data: post,
  });
};

const update = async (req, res) => {
  const postId = validate(getPostSchema, req.params.postId);

  const post = await Post.findById(postId);
  if (!post) throw new ResponseError('Post not found', 404);

  const { files, fields } = await uploadFile(req, {
    fieldname: 'image',
    folderName: 'posts',
    formSchema: updatePostSchema,
  });

  if (fields.category && fields.category !== post.category) {
    const category = await Category.exists({ _id: fields.category });
    if (!category) {
      if (files && files.length > 0) {
        await cloudinary.uploader.destroy(extractPublicId(files[0].secure_url));
      }
      throw new ResponseError('Validation errors', 400, {
        category: 'Invalid category id',
      });
    }
  }

  if (files && files.length > 0) {
    if (files[0].secure_url !== post.image) {
      await cloudinary.uploader.destroy(extractPublicId(post.image));

      post.image = files[0].secure_url;
      logger.info('post image updated successfully');
    }
  }

  Object.assign(post, fields);
  await post.save();

  logger.info('post updated successfully');
  res.status(200).json({
    code: 200,
    message: 'Post updated successfully',
    data: post,
  });
};

const remove = async (req, res) => {
  const postId = validate(getPostSchema, req.params.postId);

  const post = await Post.findByIdAndDelete(postId);
  if (!post) throw new ResponseError('Post not found', 404);

  await cloudinary.uploader.destroy(extractPublicId(post.image));
  logger.info('post image deleted successfully');

  logger.info('post deleted successfully');
  res.status(200).json({
    code: 200,
    message: 'Post deleted successfully',
  });
};

const like = async (req, res) => {
  const postId = validate(getPostSchema, req.params.postId);

  const post = await Post.findById(postId);
  if (!post) throw new ResponseError('Post not found', 404);

  const hasLiked = post.likes.includes(req.user.id);
  if (hasLiked) {
    post.likes.pop(req.user.id);
    post.totalLikes -= 1;
    await post.save();

    logger.info('post unliked successfully');
    return res.status(200).json({
      code: 200,
      message: 'Post unliked successfully',
    });
  }

  post.likes.push(req.user.id);
  post.totalLikes += 1;
  await post.save();

  logger.info('post liked successfully');
  return res.status(200).json({
    code: 200,
    message: 'Post liked successfully',
  });
};

export default { create, search, show, remove, update, like };
