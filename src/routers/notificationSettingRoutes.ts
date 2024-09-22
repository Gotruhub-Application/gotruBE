import express from 'express';
import { NotificationSettingsController } from '../controllers/notificationSettingsController';


const NotificationSettingsRoutes = express.Router();
NotificationSettingsRoutes
.get('/settings/:ownerId', NotificationSettingsController.getSettings)
.put('/settings/:ownerId', NotificationSettingsController.updateSettings)
.post('/settings/:ownerId/reset', NotificationSettingsController.resetSettings)

export default NotificationSettingsRoutes;