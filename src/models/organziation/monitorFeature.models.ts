import { Schema, Document, Model, model } from 'mongoose';
import { ISession, ICourse, ITerm,IAttendance,IClassSchedule, ISubUnitCourse } from '../../interfaces/organization/monitor.interface';
import { ConvertDateTimeToNumber, createNotification, generateQrcode, isUserLocationInRange } from '../../support/helpers';
import { CompareCoordinate, CreateNotificationParams } from '../../interfaces/general.interface';
import { sendNotif } from '../../support/firebaseNotification';
import { Organization } from '../organization.models';

const sessionSchema: Schema<ISession> = new Schema<ISession>({
  name: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

const courseSchema: Schema<ICourse> = new Schema<ICourse>({
  name: { type: String, required: true },
  courseCode: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

const termSchema: Schema<ITerm> = new Schema<ITerm>({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  sessionType: { type: String, enum: ['HS', 'UN', 'OT'], required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true }
}, { timestamps: true });

termSchema.pre("find", function(){
  this.populate("sessionId")
});
termSchema.pre("findOne", function(){
  this.populate("sessionId")
});

const subUnitCourseSchema: Schema<ISubUnitCourse> = new Schema<ISubUnitCourse>({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  subUnit: { type: Schema.Types.ObjectId, ref: 'SubUnit', required: true },
  term: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
  expired: { type: Boolean, default:false },
  paid: { type: Boolean, default:false }
}, { timestamps: true });

subUnitCourseSchema.pre("find", function(){
  this
  .populate("subUnit")
  .populate("term")
  .populate("course");
});
subUnitCourseSchema.pre("findOne", function(){
  this
  .populate("subUnit")
  .populate("term")
  .populate("course");
});

const classScheduleSchema: Schema<IClassSchedule> = new Schema<IClassSchedule>({
  day:{ type: String, required: true },
  subUnit: { type: Schema.Types.ObjectId, ref: 'SubUnit', required: true },
  term: { type: Schema.Types.ObjectId, ref: 'Term', required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  expired: { type: Boolean },
  course: { type: Schema.Types.ObjectId, ref: 'SubUnitCourse', required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  location: {
    lat: { type: String, required: true },
    long: { type: String, required: true }
  },
  endlocation: {
    lat: { type: String, default: "" },
    long: { type: String, default: "" }
  },
  coordinators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  qrcode: { type: String }
}, { timestamps: true });

classScheduleSchema.pre("save",async function(next){
  if(this.isNew){
    this.qrcode = await generateQrcode(this._id.toString())
    // await this.save()
  };
  next()
});
classScheduleSchema.pre("find", function(){
  this
  .populate("course")
});
classScheduleSchema.pre("findOne", function(){
  this
  .populate("course")
});


const attendanceSchema: Schema<IAttendance> = new Schema<IAttendance>({
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  term: { type: Schema.Types.ObjectId, ref: 'Term' },
  location: {
    lat: { type: String, required: true },
    long: { type: String, required: true }
  },
  attendanceType: { type: String, enum: ['signin', 'signout'], required: true },
  remark: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  classScheduleId: { type: Schema.Types.ObjectId, ref: 'ClassSchedule', required: true },
  scanned_time:{type:Number}
}, { timestamps: true });

attendanceSchema.pre("find", function(){
  this
  .populate("classScheduleId")
  // .populate("term")
  // .populate("user")
});
attendanceSchema.pre("findOne", function(){
  this
  .populate("classScheduleId")
  // .populate("term")
  // .populate("user")
});

attendanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      this.scanned_time = ConvertDateTimeToNumber();
      const schedule = await ClassScheduleModel.findById(this.classScheduleId);

      if (schedule !== null) {
        if (this.attendanceType === "signin") {
          if (schedule.startTime < this.scanned_time) {
            this.remark = "Late";
          } else {
            this.remark = "Early";
          }
        } else {
          if (schedule.endTime < this.scanned_time) {
            this.remark = "Early";
          } else {
            this.remark = "Late";
          }
        }
        // check if suspicious activity
        const coordinates: CompareCoordinate = {
          startLocation: { lat: schedule.location.lat, long: schedule.location.long }, // New York
          endLocation: { lat: schedule.endlocation.lat, long:schedule.endlocation.long }, // Los Angeles
          userLocation: {  lat: this.location.lat, long: this.location.long  } // Example user location
        };
        const resp = isUserLocationInRange(coordinates)
        if(!resp){
          // send suspicous activity notification
          const payload:CreateNotificationParams ={
            owner:this.user,
            title:`suspicious_${this.attendanceType}`,
            type:`gotrumonitor`,
            message:`New suspicious ${this.attendanceType} at ${this.location.lat}, ${this.location.long }`
          }
          await createNotification(payload);
          // send notification 
          const notifyPayload = {
            type: `gotrumonitor`,
          };
          const orgnz = await Organization.findById(schedule.organization).select("fcmToken");
          if (orgnz?.fcmToken) {
            await sendNotif(orgnz.fcmToken, `suspicious_${this.attendanceType}`, `New suspicious ${this.attendanceType} at ${this.location.lat}, ${this.location.long}`, notifyPayload);
          }; 
        }


      }
    } catch (error:any) {
      return next(error);
    }
  }
  next();
});


// Models
export const SessionModel: Model<ISession> = model<ISession>('Session', sessionSchema);
export const CourseModel: Model<ICourse> = model<ICourse>('Course', courseSchema);
export const TermModel: Model<ITerm> = model<ITerm>('Term', termSchema);
export const SubUnitCourseModel: Model<ISubUnitCourse> = model<ISubUnitCourse>('SubUnitCourse', subUnitCourseSchema);
export const ClassScheduleModel: Model<IClassSchedule> = model<IClassSchedule>('ClassSchedule', classScheduleSchema);
export const AttendanceModel: Model<IAttendance> = model<IAttendance>('Attendance', attendanceSchema);
