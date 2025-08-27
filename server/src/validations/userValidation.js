import Joi from 'joi';
import mongoose from 'mongoose';

const userSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value))
        return helpers.message('Role id is invalid');
      return value;
    })
    .min(1)
    .label('role')
    .required(),
});

export const searchUserSchema = Joi.object({
  page: Joi.number().integer().positive().min(1).default(1),
  limit: Joi.number().integer().positive().min(1).max(100).default(10),
  q: Joi.string().allow('').optional(),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

export const getUserSchema = Joi.string()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value))
      return helpers.message('User id is invalid');
    return value;
  })
  .label('userId')
  .required();

export const signupSchema = userSchema.fork(['role'], schema =>
  schema.optional()
);

export const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const createUserSchema = userSchema;
export const updateProfileSchema = userSchema.fork(
  ['username', 'email', 'password', 'role'],
  schema => schema.optional()
);
export const updateUserSchema = userSchema.fork(
  ['username', 'email', 'password', 'role'],
  schema => schema.optional()
);

export const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).required(),
});
