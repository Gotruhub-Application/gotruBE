// sendMessageHandler.ts
import { io } from "../index";
import { logger } from "../logger";
import { EVENTS } from "../socket"; 
import { handleError, handleSuccess } from "./responses/socket.Response";
import { adminSignInOutMessage } from "./validators/passFeature/pass.admin.socket";
import { parentSignInOutResponseValidator } from "./validators/passFeature/pass.user.socket";

export function handleAdminSendParentMessage(socket: any, message: any) {

    const { error, value } = adminSignInOutMessage.validate(message);
    if (error) {
        io.to(socket.user._id).emit(EVENTS.SERVER.ERROR, handleError(400,error.message));
    }else{
        io.to(message.parentId).emit(EVENTS.CLIENT.RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_ADMIN, { value });
        io.to(socket.user._id).emit(EVENTS.SERVER.SUCCESS, handleSuccess(200));
    }
}

export function handleParentSendAdminApproveDecline(socket: any, message: any) {

    const { error, value } = parentSignInOutResponseValidator.validate(message);
    if (error) {
        io.to(socket.user._id).emit(EVENTS.SERVER.ERROR, handleError(400,error.message));
    }else{
        io.to(message.adminSenderId).emit(EVENTS.CLIENT.RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_PARENT, { value });
        io.to(socket.user._id).emit(EVENTS.SERVER.SUCCESS, handleSuccess(200));
    }
}