import mongoose from 'mongoose';
import { AttendanceModel } from '../../../models/organziation/monitorFeature.models';


interface AttendanceSummary {
  courseId: string;
  courseName: string;
  attendedSessions: number;
  totalScore: number;
  attendanceRate: number;
}

export async function getSubunitAttendanceSummaryByUserId(
  memberId: string,
  termId: string,
  classScheduleId: string
): Promise<AttendanceSummary[]> {
  const attendanceSummary = await AttendanceModel.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(memberId),
        term: new mongoose.Types.ObjectId(termId),
        classScheduleId: new mongoose.Types.ObjectId(classScheduleId),
        // flag:false
      },
    },
    {
      $lookup: {
        from: 'classschedules',
        localField: 'classScheduleId',
        foreignField: '_id',
        as: 'classSchedule',
      },
    },
    {
      $unwind: {
        path: '$classSchedule',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subunitcourses',
        localField: 'classSchedule.course',
        foreignField: '_id',
        as: 'subUnitCourse',
      },
    },
    {
      $unwind: {
        path: '$subUnitCourse',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'subUnitCourse.course',
        foreignField: '_id',
        as: 'course',
      },
    },
    {
      $unwind: {
        path: '$course',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: { $ifNull: ['$course._id', null] },
        courseName: { $first: { $ifNull: ['$course.courseCode', 'Unknown Course'] } },
        totalScore: {
          $sum: {
            $cond: [
              { $eq: ['$attendanceType', 'signin'] },
              { $toDouble: { $ifNull: ['$score', '0'] } },
              0,
            ],
          },
        },
        attendedSessions: {
          $sum: { $cond: [{ $eq: ['$attendanceType', 'signin'] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        courseId: { $ifNull: ['$_id', 'unknown'] },
        courseName: 1,
        attendedSessions: 1,
        totalScore: 1,
        attendanceRate: {
          $cond: [
            { $gt: ['$attendedSessions', 0] },
            { $multiply: [{ $divide: ['$totalScore', { $multiply: [50, 100] }] }, 100] },
            0,
          ],
        },
      },
    },
    {
      $match: {
        courseId: { $ne: 'unknown' },
      },
    },
  ]);
  console.log(attendanceSummary)
  return attendanceSummary;
}

