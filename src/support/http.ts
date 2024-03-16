import { Request, Response } from "express";

export const failedResponse =(res:Response, statusCode: number, message:string = "Failed", success:boolean =false )=>{
    return res.status(statusCode).json({ success: success, message: message });
};
export const successResponse = (res: Response, statusCode: number, message: string = "Success", data: any = null, success: boolean = true) => {
    return res.status(statusCode).json({ success: success, message: message, data: data });
  };