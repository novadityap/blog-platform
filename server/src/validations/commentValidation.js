import Joi from 'joi';
import mongoose from 'mongoose';

const commentSchema = Joi.object({
  parentCommentId: Joi.string()
    .custom((value, helpers) => {
      if (!value) return value;
      if (!mongoose.Types.ObjectId.isValid(value))
        return helpers.message('Parent comment id is invalid');
      return value;
    })
    .label('parentCommentId')
    .optional()
    .allow(null),
  text: Joi.string().required(),
});

export const searchCommentSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});
export const getCommentSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('Comment id is invalid');
    return value;
  })
  .label('commentId')
  .required();
export const createCommentSchema = commentSchema;
export const updateCommentSchema = commentSchema.fork(['text'], schema =>
  schema.optional()
);
