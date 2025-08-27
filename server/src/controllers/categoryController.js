import Category from '../models/categoryModel.js';
import ResponseError from '../utils/responseError.js';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategorySchema,
  searchCategorySchema,
} from '../validations/categoryValidation.js';
import validate from '../utils/validate.js';
import logger from '../utils/logger.js';
import formatMongoDoc from '../utils/formatMongoDoc.js';

const create = async (req, res) => {
  const fields = validate(createCategorySchema, req.body);

  const isNameTaken = await Category.exists({ name: fields.name });
  if (isNameTaken) {
    throw new ResponseError('Validation errors', 400, {
      name: 'Name already in use',
    });
  }

  await Category.create(fields);

  logger.info('category created successfully');
  res.status(201).json({
    code: 201,
    message: 'Category created successfully',
  });
};

const update = async (req, res) => {
  const categoryId = validate(getCategorySchema, req.params.categoryId);
  const fields = validate(updateCategorySchema, req.body);

  const category = await Category.findById(categoryId);
  if (!category) throw new ResponseError('Category not found', 404);

  if (fields.name && fields.name !== category.name) {
    const isNameTaken = await Category.exists({ name: fields.name });

    if (isNameTaken) {
      throw new ResponseError('Validation errors', 400, {
        name: 'Name already in use',
      });
    }
  }

  Object.assign(category, fields);
  await category.save();

  logger.info('category updated successfully');
  res.status(200).json({
    code: 200,
    message: 'Category updated successfully',
    data: category,
  });
};

const remove = async (req, res) => {
  const categoryId = validate(getCategorySchema, req.params.categoryId);

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) throw new ResponseError('Category not found', 404);

  logger.info('category deleted successfully');
  res.status(200).json({
    code: 200,
    message: 'Category deleted successfully',
  });
};

const show = async (req, res) => {
  const categoryId = validate(getCategorySchema, req.params.categoryId);

  const category = await Category.findById(categoryId);
  if (!category) throw new ResponseError('Category not found', 404);

  logger.info('category retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Category retrieved successfully',
    data: category,
  }); 
};

export const search = async (req, res) => {
  const query = validate(searchCategorySchema, req.query);
  const { page, limit, q, sortBy, sortOrder } = query;

  const [{ categories, totalCategories }] = await Category.aggregate()
    .lookup({
      from: 'posts',
      localField: '_id',
      foreignField: 'category',
      as: 'posts',
      pipeline: [{ $count: 'count' }],
    })
    .addFields({
      totalPosts: { $ifNull: [{ $arrayElemAt: ['$posts.count', 0] }, 0] },
    })
    .project({ posts: 0 })
    .match(q ? { name: { $regex: q, $options: 'i' } } : {})
    .facet({
      categories: [
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalCategories: [{ $count: 'count' }],
    })
    .project({
      categories: 1,
      totalCategories: {
        $ifNull: [{ $arrayElemAt: ['$totalCategories.count', 0] }, 0],
      },
    });

  if (categories.length === 0) {
    logger.info('no categories found');
    return res.status(200).json({
      code: 200,
      message: 'No categories found',
      data: [],
      meta: {
        pageSize: limit,
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      },
    });
  }

  const formattedCategories = categories.map((category) => formatMongoDoc(category, true));

  logger.info('categories retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Categories retrieved successfully',
    data: formattedCategories,
    meta: {
      pageSize: limit,
      totalItems: totalCategories,
      currentPage: page,
      totalPages: Math.ceil(totalCategories / limit),
    },
  });
};

const list = async (req, res) => {
  const categories = await Category.find().select('name');
  if (categories.length === 0) {
    logger.info('no categories found');
    return res.status(200).json({
      code: 200,
      message: 'No categories found',
      data: [],
    });
  }

  logger.info('categories retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Categories retrieved successfully',
    data: categories,
  });
};

export default { create, update, remove, show, search, list };
