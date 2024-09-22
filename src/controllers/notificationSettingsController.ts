import { Request, Response } from 'express';
import NotificationSetting from '../models/notificationSettingModel';
import { notificationSettingsSchema } from '../validators/notificationSetingSchema';
import { INotificationSetting } from '../models/notificationSettingModel';


export class NotificationSettingsController {
  // Get notification settings for a user
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.params.ownerId;
      let settings = await NotificationSetting.findOne({ ownerId });

      if (!settings) {
        settings = await NotificationSetting.create({ownerId})

      }

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Update notification settings
  static async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.params.ownerId;
      const updates: Partial<INotificationSetting> = req.body;

      // Validate the request body
      const { error } = notificationSettingsSchema.validate(updates);
      if (error) {
        res.status(400).json({ message: 'Invalid input', details: error.details });
        return;
      }

      const settings = await NotificationSetting.findOneAndUpdate(
        { ownerId },
        { $set: updates },
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Reset notification settings to default
  static async resetSettings(req: Request, res: Response): Promise<void> {
    try {
      const ownerId = req.params.ownerId;

      const defaultSettings: INotificationSetting = {
        ownerId,
        gotrupassAlerts: { signIn: true, signOut: true },
        gotrumonitorAlerts: { signIn: true, signOut: true },
        gotruAlerts: { credit: true, debit: true }
      } as INotificationSetting;

      const settings = await NotificationSetting.findOneAndUpdate(
        { ownerId },
        defaultSettings,
        { new: true, upsert: true }
      );

      res.status(200).json(settings);
    } catch (error) {
      console.error('Error resetting notification settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}