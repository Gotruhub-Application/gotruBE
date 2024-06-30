// sendMessageHandler.ts
import { io } from "../index";
import { logger } from "../logger";
import { User } from "../models/organization.models";
import { EVENTS } from "../socket"; 
import { sendNotif } from "../support/firebaseNotification";
import { writeErrosToLogs } from "../support/helpers";
import { handleError, handleSuccess } from "./responses/socket.Response";
import { adminSignInOutMessage } from "./validators/passFeature/pass.admin.socket";
import { parentSignInOutResponseValidator } from "./validators/passFeature/pass.user.socket";

export async function handleAdminSendParentMessage(socket: any, message: any) {

    const { error, value } = adminSignInOutMessage.validate(message);
    if (error) {
        
        io.to(socket.user._id).emit(EVENTS.SERVER.ERROR, handleError(400,error.message));
    }else{
        io.to(message.parentId).emit(EVENTS.CLIENT.RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_ADMIN, { value });
        io.to(socket.user._id).emit(EVENTS.SERVER.SUCCESS, handleSuccess(200));

        // send notification
        const notifyPayload = {
            type: `pass_authorization`,
            ...value

        };
        
        try {
            const user = await User.findById(message.parentId).select("fcmToken");
            
            if (user?.fcmToken) {
                await sendNotif(user.fcmToken, `Pass authorization`, `Your action is required`, notifyPayload);
            }; 
        } catch (err) {
            
            writeErrosToLogs(err)
        }
    }
}

export async function handleParentSendAdminApproveDecline(socket: any, message: any) {

    const { error, value } = parentSignInOutResponseValidator.validate(message);
    if (error) {
        io.to(socket.user._id).emit(EVENTS.SERVER.ERROR, handleError(400,error.message));
    }else{
        io.to(message.adminSenderId).emit(EVENTS.CLIENT.RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_PARENT, { value });
        io.to(socket.user._id).emit(EVENTS.SERVER.SUCCESS, handleSuccess(200));
        // send notification
        
        const notifyPayload = {
            type: `pass_authorization`,
            ...value

        };
        try {
            const user = await User.findById(message.adminSenderId).select("fcmToken");
            
            if (user?.fcmToken) {
              await sendNotif(user.fcmToken, `Pass authorization`, `Your action is required`, notifyPayload);
            }
          } catch (err) {
            
            writeErrosToLogs(err);
        } 
    }
}

