import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import auth from './app/middlewares/auth';

const routes = new Router();

// SESSIONS
routes.post('/sessions', SessionController.store);

// USERS
routes.post('/users', UserController.store);

routes.put('/users', auth, UserController.update);

routes.get('/users', UserController.index);

routes.get('/users/:email', UserController.show);

export default routes;
