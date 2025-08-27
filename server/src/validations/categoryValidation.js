import Joi from 'joi';
import mongoose from 'mongoose';

const categorySchema = Joi.object({
  name: Joi.string().required(),
});

export const searchCategorySchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});
export const getCategorySchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('Category id is invalid');
    return value;
  })
  .label('categoryId')
  .required();
export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema.fork(['name'], schema =>
  schema.optional()
);
