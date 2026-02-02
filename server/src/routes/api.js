import express from 'express';
import categoryController from '../controllers/categoryController.js';
import commentController from '../controllers/commentController.js';
import postController from '../controllers/postController.js';
import dashboardController from '../controllers/dashboardController.js';
import roleController from '../controllers/roleController.js';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import authorize from '../middlewares/authorize.js';
import authenticate from '../middlewares/authenticate.js';

const apiRouter = express.Router();

// Public API
apiRouter.post('/auth/signup', authController.signup);
apiRouter.post('/auth/google-signin', authController.googleSignin);
apiRouter.post('/auth/verify-email/:verificationToken', authController.verifyEmail);
apiRouter.post('/auth/resend-verification', authController.resendVerification);
apiRouter.post('/auth/refresh-token', authController.refreshToken);
apiRouter.post('/auth/signin', authController.signin);
apiRouter.post('/auth/request-reset-password', authController.requestResetPassword);
apiRouter.post('/auth/reset-password/:resetToken', authController.resetPassword);
apiRouter.get('/categories', categoryController.list);
apiRouter.get('/posts/search', postController.search);
apiRouter.get('/posts/:postId', postController.show);
apiRouter.get('/posts/:postId/comments', commentController.listByPost);

// Auth API
apiRouter.post('/auth/signout', authenticate, authController.signout);

// Category API
apiRouter.post('/categories', authenticate, authorize(['admin']), categoryController.create);
apiRouter.get('/categories/search', authenticate, authorize(['admin']), categoryController.search);
apiRouter.get('/categories/:categoryId', authenticate, authorize(['admin']), categoryController.show);
apiRouter.put('/categories/:categoryId', authenticate, authorize(['admin']), categoryController.update);
apiRouter.delete('/categories/:categoryId', authenticate, authorize(['admin']), categoryController.remove
);

// Comment API
apiRouter.get('/comments/search', authenticate, authorize(['admin']), commentController.search);
apiRouter.post('/posts/:postId/comments', authenticate, authorize(['admin', 'user']), commentController.create);
apiRouter.get('/posts/:postId/comments/:commentId', authenticate, authorize(['admin']), commentController.show);
apiRouter.put('/posts/:postId/comments/:commentId', authenticate, authorize(['admin']), commentController.update);
apiRouter.delete('/posts/:postId/comments/:commentId', authenticate, authorize(['admin', 'user']), commentController.remove);

// Post API
apiRouter.post('/posts', authenticate, authorize(['admin']), postController.create);
apiRouter.put('/posts/:postId', authenticate, authorize(['admin']), postController.update);
apiRouter.put('/posts/:postId/like', authenticate, authorize(['admin', 'user']), postController.like);
apiRouter.delete('/posts/:postId', authenticate, authorize(['admin']), postController.remove);

// Dashboard API
apiRouter.get('/dashboard', authenticate, authorize(['admin']), dashboardController.stats);

// Role API
apiRouter.post('/roles', authenticate, authorize(['admin']), roleController.create);
apiRouter.get('/roles/search', authenticate, authorize(['admin']), roleController.search);
apiRouter.get('/roles', authenticate, authorize(['admin']), roleController.list);
apiRouter.get('/roles/:roleId', authenticate, authorize(['admin']), roleController.show);
apiRouter.put('/roles/:roleId', authenticate, authorize(['admin']), roleController.update);
apiRouter.delete('/roles/:roleId', authenticate, authorize(['admin']), roleController.remove);

// User API
apiRouter.get('/users/search', authenticate, authorize(['admin']), userController.search);
apiRouter.post('/users', authenticate, authorize(['admin']), userController.create);
apiRouter.get('/users/:userId', authenticate, authorize(['admin', 'user']), userController.show);
apiRouter.put('/users/:userId', authenticate, authorize(['admin']), userController.update);
apiRouter.put('/users/:userId/profile', authenticate, authorize(['admin', 'user']), userController.updateProfile);
apiRouter.delete('/users/:userId', authenticate, authorize(['admin', 'user']), userController.remove);

export default apiRouter;