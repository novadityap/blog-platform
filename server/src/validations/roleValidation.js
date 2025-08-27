import Joi from 'joi';
import mongoose from 'mongoose';

const roleSchema = Joi.object({
  name: Joi.string().required(),
});

export const searchRoleSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});
export const getRoleSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('Role id is invalid');
    return value;
  })
  .label('roleId')
  .required();
export const createRoleSchema = roleSchema;
export const updateRoleSchema = roleSchema.fork(['name'], schema =>
  schema.optional()
);
