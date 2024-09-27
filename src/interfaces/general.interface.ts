import { string } from 'joi';
import mongoose, { Schema, Document } from 'mongoose';

export interface BlackListedTokenDocument extends Document {
  token: string
};

export interface IPassNotificationData extends Document {
  data: Record<string, any>; // Using Record<string, any> instead of object for better type safety
  createdAt: Date;
  updatedAt: Date;
}


export interface INotification extends Document {
  owner: string;
  organization: string;
  type: string;
  title: string,
  // entityId?: string;
  // entityModel?: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationParams {
  owner?: string;
  title?: string;
  type?: string;
  message?: string;
};

export interface CompareCoordinate {
  startLocation: {
    lat: string;
    long: string;
  };
  endLocation: {
    lat: string;
    long: string;
  };
  userLocation: {
    lat: string;
    long: string;
  };
}
