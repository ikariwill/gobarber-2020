import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// SESSIONS
routes.post('/sessions', SessionController.store);

// USERS
routes.post('/users', UserController.store);

routes.put('/users', authMiddleware, UserController.update);

routes.get('/users', UserController.index);

routes.get('/users/:email', UserController.show);

routes.get('/providers', authMiddleware, ProviderController.index);

// UPLOAD
routes.post(
  '/files',
  authMiddleware,
  upload.single('file'),
  FileController.store
);

export default routes;
