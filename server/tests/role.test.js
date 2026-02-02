import request from 'supertest';
import app from '../src/app.js';
import {
  createTestUser,
  updateTestUser,
  removeAllTestUsers,
  createAccessToken,
  createTestRole,
  getTestRole,
  createManyTestRoles,
  removeAllTestRoles,
} from './testUtil.js';

describe('GET /api/roles', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return all roles', async () => {
    await createManyTestRoles();

    const result = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Roles retrieved successfully');
    expect(result.body.data).toBeDefined();
  });
});

describe('GET /api/roles/search', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
    await createManyTestRoles();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .get('/api/roles/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return a list of roles with default pagination', async () => {
    const result = await request(app)
      .get('/api/roles/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Roles retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBeGreaterThanOrEqual(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('should return a list of roles with custom search', async () => {
    const result = await request(app)
      .get('/api/roles/search')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Roles retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/roles/:roleId', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .get(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const result = await request(app)
      .get('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.roleId).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const result = await request(app)
      .get(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Role not found');
  });

  it('should return a role if role id is valid', async () => {
    const role = await createTestRole();
    const result = await request(app)
      .get(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Role retrieved successfully');
    expect(result.body.data).toBeDefined();
  });
});

describe('POST /api/roles', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestRole();

    const result = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should create a role if input data is valid', async () => {
    const result = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test',
      });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Role created successfully');
  });
});

describe('PUT /api/roles/:roleId', () => {
  beforeEach(async () => {
    await createTestRole();
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({ role: role._id });
    await createAccessToken();

    const result = await request(app)
      .put(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const result = await request(app)
      .put('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.roleId).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestRole({ name: 'test1' });

    const role = await getTestRole();
    const result = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const result = await request(app)
      .put(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Role not found');
  });

  it('should update role if input data is valid', async () => {
    const role = await getTestRole();
    const result = await request(app)
      .put(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Role updated successfully');
    expect(result.body.data.name).toBe('test1');
  });
});

describe('DELETE /api/roles/:roleId', () => {
  beforeEach(async () => {
    await createTestRole();
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestUsers();
    await removeAllTestRoles();
  });

  it('should return an error if user does not have permission', async () => {
    const userRole = await getTestRole('user');
    await updateTestUser({ role: userRole._id });
    await createAccessToken();

    const role = await getTestRole();
    const result = await request(app)
      .delete(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if role id is invalid', async () => {
    const result = await request(app)
      .delete('/api/roles/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.roleId).toBeDefined();
  });

  it('should return an error if role is not found', async () => {
    const result = await request(app)
      .delete(`/api/roles/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Role not found');
  });

  it('should delete role if role id is valid', async () => {
    const role = await getTestRole();
    const result = await request(app)
      .delete(`/api/roles/${role._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Role deleted successfully');
  });
});
