import {Router} from "express"
import { NotificationController, PassNotificationDataController } from "../controllers/general";

export const generalRoute = Router();

generalRoute
.get("/notification/:myId", NotificationController.myNotifications)
.put("/notification/:myId", NotificationController.markAllAsRead)
.put("/notification/:myId/:id", NotificationController.markSingleAsRead)

.post("/pass-notification-data", PassNotificationDataController.createPassNotificationData)
.get("/pass-notification-data/:id", PassNotificationDataController.getPassNotificationDataById)
.delete("/pass-notification-data/:id", PassNotificationDataController.deletePassNotificationDataById)