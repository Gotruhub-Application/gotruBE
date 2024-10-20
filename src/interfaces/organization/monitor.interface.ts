import { Schema,Types, Document } from 'mongoose';
import { IOrganization, ISubUnit, Iuser } from '../organization';

// Define the Session interface extending Mongoose Document
export interface ISession extends Document {
  name: string;
  organization: IOrganization['_id'];
}

export interface ICourse extends Document {
  name: string;
  courseCode: string;
  unit?: Schema.Types.ObjectId;
  organization: IOrganization['_id'];
}

export interface ITerm extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  sessionType: 'HS' | 'UN' | 'OT';
  sessionId: ISession['_id'];
  organization: IOrganization['_id'];
  expired:boolean;
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
export interface Ilocation extends Document {
  name:string
  organization: Types.ObjectId;
  location: { lat: string; long: string };
  endlocation: { lat: string; long: string };
}

// Create a timetable for different courses for a subunit
export interface IClassSchedule extends Document {
  day:string;
  subUnit: ISubUnit['_id'];
  locationId: Ilocation["_id"];
  term: ITerm['_id'];
  expired: boolean;
  course: ISubUnitCourse['_id'];
  organization:IOrganization["_id"];
  startTime: number;
  endTime: number;
  location: { lat: string; long: string };
  endlocation: { lat: string; long: string };
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
  score: string;
  isValid: boolean;
  flag: boolean;
  user: Iuser['_id'];
  classScheduleId: IClassSchedule['_id'];
  scanned_time:number;
}

export interface IAttendanceGrading extends Document {
  organization: Types.ObjectId;
  name: 'early' | 'late' | 'absent';
  type: 'monitorEnd' | 'monitorSource';
  value: number;
  time: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IthreadholdValue extends Document {
  organization: Types.ObjectId;
  name: 'excellent' | 'pass' | 'fail';
  type: 'monitorEnd' | 'monitorSource';
  minVal: number;
  maxVal: number;
  createdAt: Date;
  updatedAt: Date;
}
