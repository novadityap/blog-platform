import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  searchUserSchema,
  updateProfileSchema,
} from '../validations/userValidation.js';
import User from '../models/userModel.js';
import Role from '../models/roleModel.js';
import validate from '../utils/validate.js';
import uploadFile from '../utils/uploadFile.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcrypt';
import checkOwnership from '../utils/checkOwnership.js';
import cloudinary from '../utils/cloudinary.js';
import extractPublicId from '../utils/extractPublicId.js';
import mongoose from 'mongoose';
import formatMongoDoc from '../utils/formatMongoDoc.js';

const show = async (req, res) => {
  const userId = validate(getUserSchema, req.params.userId);
   await checkOwnership({
    modelName: 'user',
    paramsId: userId,
    currentUser: req.user,
  });

  const user = await User.findById(userId).populate('role');
  if (!user) {
    throw new ResponseError('User not found', 404);
  }

  logger.info('user retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'User retrieved successfully',
    data: user,
  });
};

const updateProfile = async (req, res) => {
  const userId = validate(getUserSchema, req.params.userId);
  await checkOwnership({
    modelName: 'user',
    paramsId: userId,
    currentUser: req.user,
  });

  const user = await User.findById(userId).populate('role', 'name');

  if (!user) throw new ResponseError('User not found', 404);

  const { files, fields } = await uploadFile(req, {
    fieldname: 'avatar',
    folderName: 'avatars',
    formSchema: updateProfileSchema,
  });

  const errors = {};
  const checkDuplicateConditions = [];

  if (fields.username && fields.username !== user.username) {
    checkDuplicateConditions.push({
      username: fields.username,
    });
  }

  if (fields.email && fields.email !== user.email) {
    checkDuplicateConditions.push({
      email: fields.email,
    });
  }

  if (checkDuplicateConditions.length > 0) {
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: checkDuplicateConditions,
    });

    if (existingUser) {
      if (existingUser.username === fields.username)
        errors.username = 'Username already in use';
      if (existingUser.email === fields.email)
        errors.email = 'Email already in use';
    }
  }

  if (Object.keys(errors).length > 0)
    throw new ResponseError('Validation errors', 400, errors);

  if (fields.password) fields.password = await bcrypt.hash(fields.password, 10);

  if (files && files.length > 0) {
    if (user.avatar !== process.env.DEFAULT_AVATAR_URL)
      await cloudinary.uploader.destroy(extractPublicId(user.avatar));

    fields.avatar = files[0].secure_url;
    logger.info('avatar updated successfully');
  }

  Object.assign(user, fields);
  await user.save();

  logger.info('profile updated successfully');
  res.status(200).json({
    code: 200,
    message: 'Profile updated successfully',
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role.name,
    },
  });
};

const search = async (req, res) => {
  const query = validate(searchUserSchema, req.query);
  const { page, limit, q, sortBy, sortOrder } = query;

  const [{ users, totalUsers }] = await User.aggregate()
    .match({ _id: { $ne: new mongoose.Types.ObjectId(req.user.id) } })
    .lookup({
      from: 'roles',
      localField: 'role',
      foreignField: '_id',
      as: 'role',
      pipeline: [{ $project: { name: 1 } }],
    })
    .unwind('role')
    .match(
      q
        ? {
            $or: [
              { username: { $regex: q, $options: 'i' } },
              { email: { $regex: q, $options: 'i' } },
              { 'role.name': { $regex: q, $options: 'i' } },
            ],
          }
        : {}
    )
    .facet({
      users: [
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalUsers: [{ $count: 'count' }],
    })
    .project({
      users: 1,
      totalUsers: {
        $ifNull: [{ $arrayElemAt: ['$totalUsers.count', 0] }, 0],
      },
    });

  if (users.length === 0) {
    logger.info('no users found');
    return res.status(200).json({
      code: 200,
      message: 'No users found',
      data: [],
      meta: {
        pageSize: limit,
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      },
    });
  }

  const formattedUsers = users.map(user => formatMongoDoc(user, true));

  logger.info('users retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Users retrieved successfully',
    data: formattedUsers,
    meta: {
      pageSize: limit,
      totalItems: totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
    },
  });
};

const create = async (req, res) => {
  const fields = validate(createUserSchema, req.body);
  const errors = {};

  const user = await User.findOne({
    $or: [{ username: fields.username }, { email: fields.email }],
  }).select('username email');

  if (user) {
    if (user.username === fields.username)
      errors.username = 'Username already in use';
    if (user.email === fields.email) errors.email = 'Email already in use';

    throw new ResponseError('Validation errors', 400, errors);
  }

  const role = await Role.exists({ _id: fields.role });
  if (!role) {
    throw new ResponseError('Validation errors', 400, {
      roles: 'Invalid role id',
    });
  }

  fields.password = await bcrypt.hash(fields.password, 10);

  await User.create({
    isVerified: true,
    verificationToken: null,
    verificationTokenExpires: null,
    ...fields,
  });

  logger.info('user created successfully');
  res.status(201).json({
    code: 201,
    message: 'User created successfully',
  });
};

const update = async (req, res) => {
  const userId = validate(getUserSchema, req.params.userId);
  await checkOwnership({
    modelName: 'user',
    paramsId: userId,
    currentUser: req.user,
  });

  const user = await User.findById(userId);
  if (!user) throw new ResponseError('User not found', 404);

  const { files, fields } = await uploadFile(req, {
    fieldname: 'avatar',
    folderName: 'avatars',
    formSchema: updateUserSchema,
  });

  const errors = {};
  const checkDuplicateConditions = [];

  if (fields.username && fields.username !== user.username) {
    checkDuplicateConditions.push({
      username: fields.username,
    });
  }

  if (fields.email && fields.email !== user.email) {
    checkDuplicateConditions.push({
      email: fields.email,
    });
  }

  if (checkDuplicateConditions.length > 0) {
    const existingUser = await User.findOne({
      _id: { $ne: userId },
      $or: checkDuplicateConditions,
    });

    if (existingUser) {
      if (existingUser.username === fields.username)
        errors.username = 'Username already in use';
      if (existingUser.email === fields.email)
        errors.email = 'Email already in use';
    }
  }

  if (Object.keys(errors).length > 0)
    throw new ResponseError('Validation errors', 400, errors);

  if (fields.role) {
    const role = await Role.exists({ _id: fields.role });
    if (!role) {
      throw new ResponseError('Validation errors', 400, {
        roles: 'Invalid role id',
      });
    }
  }

  if (fields.password) fields.password = await bcrypt.hash(fields.password, 10);

  if (files && files.length > 0) {
    if (user.avatar !== process.env.DEFAULT_AVATAR_URL)
      await cloudinary.uploader.destroy(extractPublicId(user.avatar));

    fields.avatar = files[0].secure_url;
    logger.info('avatar updated successfully');
  }

  Object.assign(user, fields);
  await user.save();

  logger.info('user updated successfully');
  res.status(200).json({
    code: 200,
    message: 'User updated successfully',
    data: user,
  });
};

const remove = async (req, res) => {
  const userId = validate(getUserSchema, req.params.userId);
  await checkOwnership({
    modelName: 'user',
    paramsId: userId,
    currentUser: req.user,
  });

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ResponseError('User not found', 404);
  }

  if (user.avatar !== process.env.DEFAULT_AVATAR_URL) {
    await cloudinary.uploader.destroy(extractPublicId(user.avatar));
    logger.info('avatar deleted successfully');
  }

  logger.info('user deleted successfully');
  res.status(200).json({
    code: 200,
    message: 'User deleted successfully',
  });
};

export default { show, search, create, update, remove, updateProfile };
