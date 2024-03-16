import { Request, Response, NextFunction } from "express";
import { Media } from "../models/media.models";
import dotenv from "dotenv";
import { failedResponse, successResponse } from "../support/http";
import { logger } from "../logger"; 


dotenv.config()

export const UploadFile= async (req:Request, res:Response, next:NextFunction) => {

  try {
    const media = new Media({
        file:`${req.body.file_url}`,
        key:`${req.body.file_key}`,
    })
    await media.save()

    return successResponse(res, 200,"File uploaded successfuly", media)
  } catch (error:any) {
    logger.error(error);
    return failedResponse(res, 500, `${error.message}`)
  }
};

export const allMedia = async (req:Request, res:Response, next:NextFunction) => {

    try {
      const media = await Media.find()
  
      return successResponse(res, 200,"File uploaded successfuly", media)
    } catch (error:any) {
      logger.error(error);
      return failedResponse(res, 500, `${error.message}`)
    }
  };
