import { Schema, Document } from 'mongoose';
import { IOrganization, ISubUnit, Iuser } from '../organization';

// Define the Session interface extending Mongoose Document
export interface ISession extends Document {
  name: string;
  organization: IOrganization['_id'];
}

export interface ICourse extends Document {
  name: string;
  courseCode: string;
  organization: IOrganization['_id'];
}

export interface ITerm extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  sessionType: 'HS' | 'UN' | 'OT';
  sessionId: ISession['_id'];
  organization: IOrganization['_id'];
}

// Assign a course to a subunit
export interface ISubUnitCourse extends Document {
  course: ICourse['_id'];
  organization: IOrganization['_id'];
  subUnit: ISubUnit['_id'];
  term: ITerm['_id'];
  expired: boolean;
  paid: boolean;
}

// Create a timetable for different courses for a subunit
export interface IClassSchedule extends Document {
  day:string;
  subUnit: ISubUnit['_id'];
  term: ITerm['_id'];
  expired: boolean;
  course: ISubUnitCourse['_id'];
  organization:IOrganization["_id"];
  startTime: number;
  endTime: number;
  location: { lat: string; long: string };
  coordinators: Iuser['_id'][];
  qrcode: string;
}

// Take attendance for the staff and students who attended the class
export interface IAttendance extends Document {
  organization: IOrganization['_id'];
  term: ITerm['_id'];
  location: { lat: string; long: string };
  attendanceType: 'signin' | 'signout';
  remark: string;
  user: Iuser['_id'];
  classScheduleId: IClassSchedule['_id'];
  scanned_time:number;
}
