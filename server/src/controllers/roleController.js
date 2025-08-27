import Role from '../models/roleModel.js';
import ResponseError from '../utils/responseError.js';
import logger from '../utils/logger.js';
import validate from '../utils/validate.js';
import {
  createRoleSchema,
  updateRoleSchema,
  getRoleSchema,
  searchRoleSchema,
} from '../validations/roleValidation.js';
import formatMongoDoc from '../utils/formatMongoDoc.js';

const create = async (req, res) => {
  const fields = validate(createRoleSchema, req.body);

  const isNameTaken = await Role.exists({ name: fields.name });
  if (isNameTaken) {
    throw new ResponseError('Validation errors', 400, {
      name: 'Name already in use',
    });
  }

  await Role.create(fields);

  logger.info('role created successfully');
  res.status(201).json({
    code: 201,
    message: 'Role created successfully',
  });
};

const search = async (req, res) => {
  const query = validate(searchRoleSchema, req.query);
  const { page, limit, q, sortBy, sortOrder } = query;

  const [{ roles, totalRoles }] = await Role.aggregate()
    .match(q ? { name: { $regex: q, $options: 'i' } } : {})
    .facet({
      roles: [
        { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ],
      totalRoles: [{ $count: 'count' }],
    })
    .project({
      roles: 1,
      totalRoles: {
        $ifNull: [{ $arrayElemAt: ['$totalRoles.count', 0] }, 0],
      },
    });

  if (roles.length === 0) {
    logger.info('no roles found');
    return res.status(200).json({
      code: 200,
      message: 'No roles found',
      data: [],
      meta: {
        pageSize: limit,
        totalItems: 0,
        currentPage: page,
        totalPages: 0,
      },
    });
  }

  const formattedRoles = roles.map(role => formatMongoDoc(role, true));

  logger.info('roles retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Roles retrieved successfully',
    data: formattedRoles,
    meta: {
      pageSize: limit,
      totalItems: totalRoles,
      currentPage: page,
      totalPages: Math.ceil(totalRoles / limit),
    },
  });
};

const list = async (req, res) => {
  const roles = await Role.find();
  if (roles.length === 0) {
    logger.info('no roles found');
    return res.status(200).json({
      code: 200,
      message: 'No roles found',
      data: [],
    });
  }

  logger.info('roles retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Roles retrieved successfully',
    data: roles,
  });
};

const show = async (req, res) => {
  const roleId = validate(getRoleSchema, req.params.roleId);

  const role = await Role.findById(roleId);
  if (!role) throw new ResponseError('Role not found', 404);

  logger.info('role retrieved successfully');
  res.status(200).json({
    code: 200,
    message: 'Role retrieved successfully',
    data: role,
  });
};

const update = async (req, res) => {
  const roleId = validate(getRoleSchema, req.params.roleId);
  const fields = validate(updateRoleSchema, req.body);

  const role = await Role.findById(roleId);
  if (!role) throw new ResponseError('Role not found', 404);

  if (fields.name && fields.name !== role.name) {
    const isNameTaken = await Role.exists({
      name: fields.name,
      _id: { $ne: roleId },
    });

    if (isNameTaken) {
      throw new ResponseError('Validation errors', 400, {
        name: 'Name already in use',
      });
    }
  }

  Object.assign(role, fields);
  await role.save();

  logger.info('role updated successfully');
  res.status(200).json({
    code: 200,
    message: 'Role updated successfully',
    data: role,
  });
};

const remove = async (req, res) => {
  const roleId = validate(getRoleSchema, req.params.roleId);

  const role = await Role.findByIdAndDelete(roleId);
  if (!role) throw new ResponseError('Role not found', 404);

  logger.info('role deleted successfully');
  res.status(200).json({
    code: 200,
    message: 'Role deleted successfully',
  });
};

export default { create, search, show, update, remove, list };
