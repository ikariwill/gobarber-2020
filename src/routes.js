import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import ProviderController from './app/controllers/ProviderController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';

import loggedOnly from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// SESSIONS
routes.post('/sessions', SessionController.store);

// USERS
routes.post('/users', UserController.store);

routes.put('/users', loggedOnly, UserController.update);

routes.get('/users', UserController.index);

routes.get('/users/:email', UserController.show);

routes.get('/providers', loggedOnly, ProviderController.index);

routes.post('/appointments', loggedOnly, AppointmentController.store);
routes.get('/appointments', loggedOnly, AppointmentController.index);
routes.delete('/appointments/:id', loggedOnly, AppointmentController.destroy);

routes.get('/schedules', loggedOnly, ScheduleController.index);

routes.get('/notifications', loggedOnly, NotificationController.index);
routes.put('/notifications/:id', loggedOnly, NotificationController.update);

// UPLOAD
routes.post('/files', loggedOnly, upload.single('file'), FileController.store);

export default routes;
