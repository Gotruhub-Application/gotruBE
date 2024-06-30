import {Router} from "express"
import { NotificationController } from "../controllers/general";

export const generalRoute = Router();

generalRoute
.get("/notification/:myId", NotificationController.myNotifications)
.put("/notification/:myId", NotificationController.markAllAsRead)
.put("/notification/:myId/:id", NotificationController.markSingleAsRead)