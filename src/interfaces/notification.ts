export interface INotificationProvider {
    sendNotification(user?: string, message?: string, data?: any): Promise<void>;
  }
  