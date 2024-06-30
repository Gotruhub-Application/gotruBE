// socket.ts
import { Server } from "socket.io";
import { io } from ".";
import { authenticate } from "./socket/authentication"; 
// import { handleConnection } from "./socket/eventHandlers"; 
import { handleAdminSendParentMessage, handleParentSendAdminApproveDecline,  } from "./socket/sendMessageHandler"; 
import { handleReceiveMessage } from "./socket/receiveMessageHandler";
import { logger } from "./logger";

export const EVENTS = {
  connection: "connection",
  CLIENT: {
    SIGN_IN_OR_OUT: "SIGN_IN_OR_OUT",
    SIGN_OUT: "SIGN_OUT",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
    RECEIVE_MESSAGE:"RECEIVE_MESSAGE",
    SEND_PARENT_SIGN_IN_OUT_MESSAGE:"SEND_PARENT_SIGN_IN_OUT_MESSAGE",
    RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_ADMIN:"RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_ADMIN",
    RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_PARENT:"RECIEVE_SIGN_IN_OUT_MESSAGE_FROM_PARENT",
    SEND_SIGN_IN_OUT_APPROVAL_TO_ADMIN:"SEND_SIGN_IN_OUT_APPROVAL_TO_ADMIN"
  },
  SERVER: {
    ROOMS: "ROOMS",
    ERROR: "ERROR",
    SUCCESS: "SUCCESS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    WELCOME:"WELCOME"
  },
};

export function socket() {
    io.use(authenticate);
    // io.on(EVENTS.connection, handleConnection)
    
    io.on(EVENTS.connection, (socket)=>{
      socket.join(socket.user._id); //Add user to personal group
      logger.info(socket.user);

      io.to(socket.user._id).emit(EVENTS.SERVER.WELCOME, `welcome ${socket.user._id}`);

      // disconnect user
      socket.on("disconnect", () => {
          logger.info(`Client disconnected: ${socket.id}`);
      });

      //listen to admin send pass notifcation
      socket.on(EVENTS.CLIENT.SEND_PARENT_SIGN_IN_OUT_MESSAGE, async (message:any) => {
        // admin send parent signin-out message
        await handleAdminSendParentMessage(socket, message);
      });

      //listen to parent's send pass notifcation
      socket.on(EVENTS.CLIENT.SEND_SIGN_IN_OUT_APPROVAL_TO_ADMIN, async (message:any) => {
        // PARENT send ADMIN signin-out approve-decline
        await handleParentSendAdminApproveDecline(socket, message);
      });
      
      socket.on(EVENTS.CLIENT.RECEIVE_MESSAGE, async (message:any) => {
         await handleReceiveMessage(socket, message);
      });

    });
}
