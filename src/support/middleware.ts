import multer from "multer";
import dotenv from "dotenv";
import { logger } from "../logger";
import { NextFunction, Request, Response } from "express";
import { S3Client,S3ClientConfig, PutObjectCommand } from "@aws-sdk/client-s3"
import { failedResponse, successResponse } from "./http";
import crypto from "crypto"
import { verifyJwtToken } from "./generateTokens";
import { Organization, User } from "../models/organization.models";
import path from "path";
import {  CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import { gzip } from 'zlib';

dotenv.config()
 

const {PROJ_ENV,AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY,AWS_REGION,AWS_BUCKET} = process.env
let storage;
// configure storage for development and production
if (PROJ_ENV != "DEV"){
    storage = multer.memoryStorage()
}else{
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'uploads')
        },
        filename: function (req, file, cb) {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
          cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
        }
      })
}

export const upload = multer({ storage: storage })

const s3Config: S3ClientConfig = {
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID || '',
      secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
    },
    region: AWS_REGION || 'us-west-1', // Change the default region as per your requirement
  };

const s3 = new S3Client({ ...s3Config });


const PART_SIZE = 5 * 1024 * 1024; // 5MB part size
const MAX_SIZE = 10 * 1024 * 1024; // 5MB part size

export async function handlefileUpload(req: Request, res: Response, next: NextFunction): Promise<any> {
    if (!req.file) {
        return res.status(400).json({ error: "File field is missing or empty" });
    }

    const fieldname: string = req.file.filename;
    const environ: any = PROJ_ENV;

    try {
        let key = `gotruhub/${crypto.randomUUID()}.png`;
        let filePath;

        if (environ === "DEV") {
            filePath = `${req.protocol}://${req.get('host')}/${fieldname}`;
            req.body.file_key = fieldname;
        } else {
            const fileBuffer = req.file.buffer;
            const fileSize = fileBuffer.length;

            if (fileSize > PART_SIZE) {
                if(fileSize > MAX_SIZE)  return failedResponse(res, 400, `File too large max is size is 10mb`);
                // Use multipart upload for large files
                const multipartUpload = await s3.send(new CreateMultipartUploadCommand({
                    Bucket: AWS_BUCKET,
                    Key: key,
                }));

                const uploadId = multipartUpload.UploadId;
                const uploadPromises = [];
                let partNumber = 1;

                for (let start = 0; start < fileSize; start += PART_SIZE) {
                    const end = Math.min(start + PART_SIZE, fileSize);
                    const partBuffer = fileBuffer.slice(start, end);

                    const uploadPartCommand = new UploadPartCommand({
                        Bucket: AWS_BUCKET,
                        Key: key,
                        UploadId: uploadId,
                        PartNumber: partNumber,
                        Body: partBuffer,
                    });

                    uploadPromises.push(s3.send(uploadPartCommand));
                    partNumber++;
                }

                const uploadResults = await Promise.all(uploadPromises);

                await s3.send(new CompleteMultipartUploadCommand({
                    Bucket: AWS_BUCKET,
                    Key: key,
                    UploadId: uploadId,
                    MultipartUpload: {
                        Parts: uploadResults.map((part, index) => ({
                            ETag: part.ETag,
                            PartNumber: index + 1,
                        })),
                    },
                }));
            } else {
                // Use single upload for smaller files
                const params = {
                    Bucket: AWS_BUCKET,
                    Key: key,
                    Body: fileBuffer,
                    ContentEncoding: 'gzip',
                };
                await s3.send(new PutObjectCommand(params));
            }

            filePath = `https://${AWS_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;
            req.body.file_key = key;
        }

        req.body.file_url = filePath;
        next();
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const IsAuthenticatedOrganization =async (req:Request, res:Response, next:NextFunction) =>{
  // Check if the Authorization header exists in the request

  if (!req.headers.authorization) {
      return failedResponse(res, 401, 'Access denied. Authorization header missing.');
  }
  const token =req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token){
      return failedResponse (res, 401, 'Access denied. No token provided.' )
  }
  try {
      const decodedToken = verifyJwtToken(token)
      req.params.userId= decodedToken.id; 
      req.params.organizationId =  decodedToken.id; 
      (req as any).org = decodedToken
      // check if the user has verifed their account
      const org = await Organization.findById(decodedToken.id)
      if (!org?.isVerified){
          return failedResponse (res, 401, 'Account is not verified please verify account first.' )
      }

      req.params.domain =  org.domain as string;

      next();
  } catch (error:any) {
    logger.error(error.message);
      return failedResponse (res, 401, 'Invalid token.' )
  }
}

export const IsAuthenticatedUser =async (req:Request, res:Response, next:NextFunction) =>{

  if (!req.headers.authorization) {
      return failedResponse(res, 401, 'Access denied. Authorization header missing.');
  }
  const token =req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token){
      return failedResponse (res, 401, 'Access denied. No token provided.' )
  }
  try {
      const decodedToken = verifyJwtToken(token)

      req.params.email= decodedToken.email; 
      req.params.role= decodedToken.role; 
      req.params.userId= decodedToken.id;
      req.params.organizationId =  decodedToken.organization; 
      (req as any).user = decodedToken
      // check if the user has verifed their account
      const user = await User.findById(decodedToken.id)
      if (!(req as any).user.onboardingCompleted){
          return failedResponse (res, 401, 'Account onbaording is not complated yet, please change password.' )
      }
      next();
  } catch (error:any) {
    logger.error(error.message);
      return failedResponse (res, 401, 'Invalid access token.' )
  }
}


export const IsAuthenticatedStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
      // Check if the Authorization header exists in the request
      if (!req.headers.authorization) {
          return failedResponse(res, 401, 'Access denied. Authorization header missing.');
      }

      const token = req.headers.authorization.split(' ')[1] || req.cookies.token;
      if (!token) {
          return failedResponse(res, 401, 'Access denied. No token provided.');
      }

      const decodedToken = verifyJwtToken(token);
      req.params.email = decodedToken.email;
      (req as any).user = decodedToken;

      // Check if the user has verified their account
      if (!(req as any).user.onboardingCompleted) {
          return failedResponse(res, 401, 'Account onboarding is not completed yet. Please change password.');
      }

      // Check if the user role is 'staff' or 'admin'
      if (!((req as any).user.role === 'staff' || (req as any).user.role === 'admin')) {
          return failedResponse(res, 403, 'Permission denied.');
      }

      next();
  } catch (error: any) {
      logger.error(error.message);
      return failedResponse(res, 401, 'Invalid access token.');
  }
};


export const IsAuthenticatedNewUser =async (req:Request, res:Response, next:NextFunction) =>{
  // Check if the Authorization header exists in the request
  if (!req.headers.authorization) {
      return failedResponse(res, 401, 'Access denied. Authorization header missing.');
  }
  const token =req.headers.authorization?.split(" ")[1] || req.cookies.token;
  if (!token){
      return failedResponse (res, 401, 'Access denied. No token provided.' )
  }
  try {
      const decodedToken = verifyJwtToken(token)
      req.params.email= decodedToken.email; 
      req.params.role= decodedToken.role; 
      req.params.userId= decodedToken.id;
      req.params.organizationId =  decodedToken.organization; 
      (req as any).user = decodedToken
      next();
  } catch (error:any) {
    logger.error(error.message);
      return failedResponse (res, 401, 'Invalid access token.' )
  }
}

export const IsAuthenticatedGotruAdmin =async (req:Request, res:Response, next:NextFunction) =>{
    // Check if the Authorization header exists in the request
    if (!req.headers.authorization) {
        return failedResponse(res, 401, 'Access denied. Authorization header missing.');
    }
    const token =req.headers.authorization?.split(" ")[1] || req.cookies.token;
    if (!token){
        return failedResponse (res, 401, 'Access denied. No token provided.' )
    }
    try {
        const decodedToken = verifyJwtToken(token)
        req.params.userId= decodedToken._id;
        const isAdmin = decodedToken.isAdmin
        // Check if user is gotru 'admin'
        if (!isAdmin) {
            return failedResponse(res, 403, 'Permission denied.');
        }
        (req as any).user = decodedToken
        next();
    } catch (error:any) {
      logger.error(error.message);
        return failedResponse (res, 401, 'Invalid access token.' )
    }
  }
  