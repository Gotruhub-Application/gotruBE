import { Request, Response } from 'express';
import { Notification } from '../models/general.models'; 
import { writeErrosToLogs } from '../support/helpers';
import {failedResponse, successResponse } from "../support/http";

export class NotificationController {
    static async myNotifications(req: Request, res: Response) {
        const ITEMS_PER_PAGE = parseInt(req.query.page_size as string) || 10;
        try {
            const page = parseInt(req.query.page as string) || 1;
            const skip = (page - 1) * ITEMS_PER_PAGE;
        
            // Extract type from query parameters
            const { type, read } = req.query;
        
            // Build query conditions
            const query: any = {
                owner: req.params.myId,
            };
        
            if (type) {
                query.type = type;
            }
            if (read) {
                query.read.toLower() === "true";
            }
            const notifications = await Notification.find(query)
                .skip(skip)
                .limit(ITEMS_PER_PAGE);
        
            const totalNotifications = await Notification.countDocuments(query);
            const unreadCount = await Notification.countDocuments({read:false});
        
            const totalPages = Math.ceil(totalNotifications / ITEMS_PER_PAGE);
        
            return successResponse(res, 200, 'Success', {
                notifications,
                currentPage: page,
                totalPages,
                totalNotifications,
                unreadCount
            });
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
      };

    static async markAllAsRead(req: Request, res: Response) {
        try {
          const result = await Notification.updateMany(
            { owner: req.params.myId, read: false },
            { read: true }
          );
    
          return successResponse(res, 200, 'All notifications marked as read', result);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };

    static async markSingleAsRead(req: Request, res: Response) {
        try {
          const notitication = await Notification.findByIdAndUpdate(req.params.id, {read: true }
          );
          if (!notitication) return failedResponse (res, 404, "Notitication not found")
    
          return successResponse(res, 200, 'Notification marked as read', notitication);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, error.message);
        }
    };
    
}
