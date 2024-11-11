import { Request, Response } from 'express';
import { Notification, PassNotificationData } from '../models/general.models'; 
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
                .sort({ createdAt: -1 })
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


export class PassNotificationDataController {
    // Create method
    static async createPassNotificationData(req: Request, res: Response) {
        try {
            const { data } = req.body;
            const newPassNotificationData = new PassNotificationData({ data });
            const savedData = await newPassNotificationData.save();
            return successResponse(res, 201, "PassNotificationData created successfully.", savedData);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, `Error creating PassNotificationData: ${error.message}`);
        }
    }

    // GetById method
    static async getPassNotificationDataById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const passNotificationData = await PassNotificationData.findById(id);
            if (!passNotificationData) {
                return failedResponse(res, 404, "PassNotificationData not found.");
            }
            return successResponse(res, 200, "PassNotificationData retrieved successfully.", passNotificationData);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, `Error fetching PassNotificationData: ${error.message}`);
        }
    }
    static async deletePassNotificationDataById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const passNotificationData = await PassNotificationData.findByIdAndDelete(id);
            if (!passNotificationData) {
                return failedResponse(res, 404, "PassNotificationData not found.");
            }
            return successResponse(res, 200, "PassNotificationData deleted successfully.", passNotificationData);
        } catch (error: any) {
            writeErrosToLogs(error);
            return failedResponse(res, 500, `Error fetching PassNotificationData: ${error.message}`);
        }
    }

    // // Get all PassNotificationData with pagination
    // static async getAllPassNotificationData(req: Request, res: Response) {
    //     try {
    //         const { page = 1, limit = 10 } = req.query;
    //         const pageNumber = Number(page);
    //         const limitNumber = Number(limit);

    //         const passNotificationData = await PassNotificationData.find()
    //             .limit(limitNumber)
    //             .skip((pageNumber - 1) * limitNumber)
    //             .exec();

    //         const count = await PassNotificationData.countDocuments();

    //         return successResponse(res, 200, "PassNotificationData retrieved successfully.", {
    //             passNotificationData,
    //             totalPages: Math.ceil(count / limitNumber),
    //             currentPage: pageNumber,
    //             totalItems: count
    //         });
    //     } catch (error: any) {
    //         writeErrosToLogs(error);
    //         return failedResponse(res, 500, "An error occurred while retrieving PassNotificationData.");
    //     }
    // }
}