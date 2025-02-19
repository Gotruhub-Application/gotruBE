import Joi from 'joi';
import { objectIdValidator } from '../auth/organizations';


// Joi Schema for Session
export const createSessionSchema = Joi.object({
    name: Joi.string().required(),
    
  });
  
  export const updateSessionSchema = Joi.object({
    name: Joi.string().allow(''),
    
  }).min(1);  // Ensure at least one field is being updated
  
  // Joi Schema for Term
  export const createTermSchema = Joi.object({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    sessionType: Joi.string().valid('HS', 'UN', 'OT').required(),
    sessionId: objectIdValidator.objectId().required(),
    
  });
  
  export const updateTermSchema = Joi.object({
    name: Joi.string().allow(''),
    startDate: Joi.date().allow(''),
    endDate: Joi.date().allow(''),
    sessionType: Joi.string().valid('HS', 'UN', 'OT').allow(''),
    sessionId: objectIdValidator.objectId().allow(''),
    
  }).min(1);
  
  // Joi Schema for Course
  export const createCourseSchema = Joi.object({
    name: Joi.string().required(),
    courseCode: Joi.string().allow(""),
    unit: objectIdValidator.objectId().required(),
    
  });
  
  export const updateCourseSchema = Joi.object({
    name: Joi.string().allow(''),
    courseCode: Joi.string().allow(''),
    
  }).min(1);
  
  // Joi Schema for SubUnitCourse
  export const createSubUnitCourseSchema = Joi.object({
    course: objectIdValidator.objectId().required(),
    subUnit: objectIdValidator.objectId().required(),
    term: objectIdValidator.objectId().required(),
  });
  
  export const updateSubUnitCourseSchema = Joi.object({
    course: Joi.array().items(objectIdValidator.objectId()).allow(''),
    subUnit: objectIdValidator.objectId().allow(''),
    term: objectIdValidator.objectId().allow(''),
  }).min(1);
  
  // Joi Schema for ClassSchedule
  export const createClassScheduleSchema = Joi.object({
    day:Joi.string().valid("monday","tuesday","wednesday","thursday", "friday", "saturday","sunday").required(),
    // subUnit: objectIdValidator.objectId().required(),
    // term: objectIdValidator.objectId().required(),
    course: objectIdValidator.objectId().required(),
    locationId: objectIdValidator.objectId().required(),
    startTime: Joi.number().required(),  // Assuming time format 'HH:mm'
    endTime: Joi.number().required(),
    // location: Joi.object({
    //   lat: Joi.string().required(),
    //   long: Joi.string().required()
    // }).required(),
    // endlocation: Joi.object({
    //   lat: Joi.string().required(),
    //   long: Joi.string().required()
    // }).required(),
    coordinators: Joi.array().unique().items(objectIdValidator.objectId()).required()
  });

  export const createLocationSchema = Joi.object({
    name: Joi.string().required(),
    location: Joi.object({
      lat: Joi.string().required(),
      long: Joi.string().required()
    }).required(),
    endlocation: Joi.object({
      lat: Joi.string().required(),
      long: Joi.string().required()
    }).required(),
  })

  export const UpdateLocationSchema = Joi.object({
    name: Joi.string().allow(""),
    location: Joi.object({
      lat: Joi.string().allow(""),
      long: Joi.string().allow("")
    }).allow(""),
    endlocation: Joi.object({
      lat: Joi.string().allow(""),
      long: Joi.string().allow("")
    }).allow(""),
  })
  
  export const updateClassScheduleSchema = Joi.object({
    day:Joi.string().valid("monday","tuesday","wednesday","thursday", "friday", "saturday","sunday").allow(""),
    // subUnit: objectIdValidator.objectId().allow(''),
    // term: objectIdValidator.objectId().allow(''),
    expired: Joi.boolean().allow(''),
    locationId: objectIdValidator.objectId().allow(""),
    course: objectIdValidator.objectId().allow(''),
    startTime: Joi.number().allow(''),
    endTime: Joi.number().allow(''),
    location: Joi.object({
      lat: Joi.string().allow(''),
      long: Joi.string().allow('')
    }).allow(''),
    endlocation: Joi.object({
      lat: Joi.string().allow(''),
      long: Joi.string().allow('')
    }).allow(''),
    coordinators: Joi.array().unique().items(objectIdValidator.objectId()).allow(''),
  }).min(1);


// Joi validation schema for attendance
export const createAttendanceSchema = Joi.object({
    // term:objectIdValidator.objectId().required().messages({
    //     'string.pattern.base': 'Term ID must be a valid ObjectId'
    // }),
    location: Joi.object({
        lat: Joi.string().required(),
        long: Joi.string().required()
    }).required(),
    attendanceType: Joi.string().valid('signin', 'signout').required(),
    classScheduleId:objectIdValidator.objectId().required()
});

export const updateAttendanceSchema = Joi.object({
    // term:objectIdValidator.objectId().allow('').messages({
    //     'string.pattern.base': 'Term ID must be a valid ObjectId'
    // }),
    location: Joi.object({
        lat: Joi.string().allow(''),
        long: Joi.string().allow('')
    }).allow(''),
    attendanceType: Joi.string().valid('signin', 'signout').allow(''),
    classScheduleId: objectIdValidator.objectId().allow('')
}).min(1);

export const flagAttendanceSchema = Joi.object({
  flag:Joi.boolean()
});

export const attendanceGradingValidationSchema = Joi.object({
  name: Joi.string().valid('early', 'late', 'absent').required(),
  type: Joi.string().valid('monitorEnd', 'monitorSource').allow(""),
  value: Joi.number().max(100).min(0).required(),
  time: Joi.number().max(60).min(0).required(),
});

export const attendanceGradingUpdateValidationSchema = Joi.object({
  type: Joi.string().valid('monitorEnd', 'monitorSource').allow(""),
  name: Joi.string().valid('early', 'late', 'absent').allow(""),
  value: Joi.number().max(100).min(0).allow(""),
  time: Joi.number().max(60).min(0).allow(""),
});

export const threadholdValueValidator = Joi.object({
  name: Joi.string().valid('excellent', 'pass', 'fail').required(),
  type: Joi.string().valid('monitorEnd', 'monitorSource').required(),
  maxVal: Joi.number().max(100).min(0).required(),
  minVal: Joi.number().max(100).min(0).required(),

});

export const updateThreadholdValueValidator = Joi.object({
  name: Joi.string().valid('excellent', 'pass', 'fail').optional(),
  type: Joi.string().valid('monitorEnd', 'monitorSource').optional(),
  maxVal: Joi.number().max(100).min(0).optional(),
  minVal: Joi.number().max(100).min(0).optional(),

});