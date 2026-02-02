import request from 'supertest';
import app from '../src/app.js';
import {
  createAccessToken,
  getTestRole,
  getTestCategory,
  createTestCategory,
  removeAllTestCategories,
  createTestUser,
  updateTestUser,
  removeAllTestUsers,
  createTestComment,
  createManyTestComments,
  removeAllTestComments,
  getTestComment,
  getTestPost,
  createTestPost,
  removeAllTestPosts,
} from './testUtil.js';

describe('GET /api/posts/:postId/comments', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createTestComment();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestComments();
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an empty list if post has no comments', async () => {
    await removeAllTestComments();

    const post = await getTestPost();
    const result = await request(app)
      .get(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('No comments found');
    expect(result.body.data).toHaveLength(0);
  });

  it('should return comments if post id is valid', async () => {
    const comment = await getTestComment();
    const result = await request(app)
      .get(`/api/posts/${comment.post._id}/comments`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.data[0].id).toEqual(comment._id.toString());
  });
});

describe('GET /api/posts/:postId/comments/:commentId', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createTestComment();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestComments();
    await removeAllTestPosts();
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
      .get(
        `/api/posts/${global.validObjectId}/comments/${global.validObjectId}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/invalid-id/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(
        `/api/posts/${global.validObjectId}/comments/${global.validObjectId}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should return a comment if comment id is valid', async () => {
    const comment = await getTestComment();
    const result = await request(app)
      .get(`/api/posts/${comment.post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment retrieved successfully');
  });
});

describe('GET /api/comments/search', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createManyTestComments();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestComments();
    await removeAllTestPosts();
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
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return a list of comments with default pagination', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(10);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBeGreaterThanOrEqual(15);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBeGreaterThanOrEqual(2);
  });

  it('should return a list of comments with custom search', async () => {
    const result = await request(app)
      .get('/api/comments/search')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .query({
        q: 'test10',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comments retrieved successfully');
    expect(result.body.data).toHaveLength(1);
    expect(result.body.meta.pageSize).toBe(10);
    expect(result.body.meta.totalItems).toBe(1);
    expect(result.body.meta.currentPage).toBe(1);
    expect(result.body.meta.totalPages).toBe(1);
  });
});

describe('POST /api/posts/:postId/comments', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestCategories();
    await removeAllTestPosts();
    await removeAllTestUsers();
  });

  it('should return an error if user does not authenticate', async () => {
    const result = await request(app).post(
      `/api/posts/${global.validObjectId}/comments`
    );

    expect(result.status).toBe(401);
    expect(result.body.message).toBe('Token is not provided');
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .post(`/api/posts/${global.validObjectId}/comments`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .post('/api/posts/invalid-id/comments')
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if input data is invalid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        text: '',
      });

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.text).toBeDefined();
  });

  it('should create a comment if input data is valid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .post(`/api/posts/${post._id}/comments`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({ text: 'test' });

    expect(result.status).toBe(201);
    expect(result.body.message).toBe('Comment created successfully');
  });
});

describe('PUT /api/posts/:postId/comments/:commentId', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createTestComment();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestComments();
    await removeAllTestPosts();
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
      .put(
        `/api/posts/${global.validObjectId}/comments/${global.validObjectId}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .put(`/api/posts/invalid-id/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .put(
        `/api/posts/${global.validObjectId}/comments/${global.validObjectId}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .put(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .put(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should update comment if input data is valid', async () => {
    const comment = await getTestComment();
    const result = await request(app)
      .put(`/api/posts/${comment.post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send({
        text: 'test1',
      });

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment updated successfully');
    expect(result.body.data.text).toBe('test1');
  });
});

describe('DELETE /api/posts/:postId/comments/:commentId', () => {
  beforeEach(async () => {
    await createTestCategory();
    await createTestUser();
    await createTestPost();
    await createTestComment();
    await createAccessToken();
  });

  afterEach(async () => {
    await removeAllTestComments();
    await removeAllTestPosts();
    await removeAllTestCategories();
    await removeAllTestUsers();
  });

  it('should return an error if comment is not owned by current user', async () => {
    const category = await getTestCategory();
    const role = await getTestRole('user');
    const otherUser = await createTestUser({
      username: 'test1',
      email: 'test1@me.com',
      role: role._id,
    });
    const otherPost = await createTestPost({
      title: 'test',
      slug: 'test',
      content: 'test',
      user: otherUser._id,
      category: category._id,
    });
    const otherComment = await createTestComment({
      user: otherUser._id,
      post: otherPost._id,
      text: 'test',
    });

    await updateTestUser({
      role: role._id,
    });
    await createAccessToken();

    const result = await request(app)
      .delete(
        `/api/posts/${otherComment.post._id}/comments/${otherComment._id}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(403);
    expect(result.body.message).toBe('Permission denied');
  });

  it('should return an error if post id is invalid', async () => {
    const result = await request(app)
      .delete(`/api/posts/invalid-id/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.postId).toBeDefined();
  });

  it('should return an error if post is not found', async () => {
    const result = await request(app)
      .delete(
        `/api/posts/${global.validObjectId}/comments/${global.validObjectId}`
      )
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Post not found');
  });

  it('should return an error if comment id is invalid', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/invalid-id`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(400);
    expect(result.body.message).toBe('Validation errors');
    expect(result.body.errors.commentId).toBeDefined();
  });

  it('should return an error if comment is not found', async () => {
    const post = await getTestPost();
    const result = await request(app)
      .delete(`/api/posts/${post._id}/comments/${global.validObjectId}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Comment not found');
  });

  it('should delete comment if comment id is valid', async () => {
    const comment = await getTestComment();
    const result = await request(app)
      .delete(`/api/posts/${comment.post._id}/comments/${comment._id}`)
      .set('Authorization', `Bearer ${global.accessToken}`);

    expect(result.status).toBe(200);
    expect(result.body.message).toBe('Comment deleted successfully');
  });
});
