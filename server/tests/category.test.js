import request from 'supertest';
import app from '../src/app.js';
import {
  getTestRole,
  createTestUser,
  updateTestUser,
  removeAllTestUsers,
  createAccessToken,
  createTestCategory,
  createManyTestCategories,
  getTestCategory,
  removeAllTestCategories,
} from './testUtil.js';

describe('GET /api/categories', () => {
  it('should return all categories', async () => {
    await createTestUser();
    await createAccessToken();
    await createManyTestCategories();

    const result = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');

    await removeAllTestCategories();
    await removeAllTestUsers();
  });
});

describe('GET /api/categories/search', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
    await createManyTestCategories();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return a list of categories with default pagination', async () => {
    const result = await request(app)
      .get('/api/categories/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBeGreaterThanOrEqual(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('should return a list of categories with custom search', async () => {
    const result = await request(app)
      .get('/api/categories/search')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Categories retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('GET /api/categories/:categoryId', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .get('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .get(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should return a category if category id is valid', async () => {
    const category = await createTestCategory();
    const result = await request(app)
      .get(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category retrieved successfully');
    expect(result.body.data).toBeDefined();
  });
});

describe('POST /api/categories', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({
      role: role._id,
    });
    await createAccessToken();

    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if input data is invalid', async () => {
    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory();

    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should create a category if input data is valid', async () => {
    const result = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({ name: 'test' });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Category created successfully');
  });
});

describe('PUT /api/categories/:categoryId', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
    await createTestCategory();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({
      role: role._id,
    });
    await createAccessToken();

    const category = await getTestCategory();
    const result = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .put('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if name already in use', async () => {
    await createTestCategory({ name: 'test1' });

    const category = await getTestCategory();
    const result = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.name).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .put(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should update category if input data is valid', async () => {
    const category = await getTestCategory();
    const result = await request(app)
      .put(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        name: 'test1',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category updated successfully');
    expect(result.body.data.name).toBe('test1');
  });
});

describe('DELETE /api/categories/:categoryId', () => {
  beforeEach(async () => {
    await createTestUser();
    await createAccessToken();
    await createTestCategory();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if user does not have permission', async () => {
    const role = await getTestRole('user');
    await updateTestUser({
      role: role._id,
    });
    await createAccessToken();

    const category = await getTestCategory();
    const result = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if category id is invalid', async () => {
    const result = await request(app)
      .delete('/api/categories/invalid-id')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.categoryId).toBeDefined();
  });

  it('should return an error if category is not found', async () => {
    const result = await request(app)
      .delete(`/api/categories/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Category not found');
  });

  it('should delete category if category id is valid', async () => {
    const category = await getTestCategory();
    const result = await request(app)
      .delete(`/api/categories/${category._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Category deleted successfully');
  });
});
