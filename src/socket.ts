import { Server, Socket } from "socket.io";
import { logger } from "./logger";
import { io } from ".";
import { verifyJwtToken } from "./support/generateTokens";

const EVENTS = {
    connection: "connection",
    CLIENT: {
      SIGN_IN_OR_OUT: "SIGN_IN_OR_OUT",
      SIGN_OUT: "SIGN_OUT",
      SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
      JOIN_ROOM: "JOIN_ROOM",
    },
    SERVER: {
      ROOMS: "ROOMS",
      ERROR: "ERROR",
      JOINED_ROOM: "JOINED_ROOM",
      ROOM_MESSAGE: "ROOM_MESSAGE",
    },
  };

  function authenticate(socket:any, next:any) {
    const token = socket.handshake.headers.token;
    if (!token) {
        logger.info("heheheheheh")
      return next(new Error("Authentication error"));
    }
    try {
      const decoded = verifyJwtToken(token); // Change "secret" to your JWT secret
      socket.user = decoded; // Attach user information to the socket object
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  }
  
export function socket() {
    
    // Socket.IO events
    io.use(authenticate);
    io.on(EVENTS.connection, (socket) => {

        socket.join(socket.id=socket.user._id);
        logger.info(socket.user)

        io.to(socket.id).emit("hello",`welcome ${socket.id}`);

        socket.on(EVENTS.CLIENT.SIGN_IN_OR_OUT, (parentId:any, message:any, actionType:any) => {
            if (actionType !== "signin" || "signout") {
              io.to(socket.id).emit(EVENTS.SERVER.ERROR, {statusCode:400, message:"actionType must be either signin or  signout."})
            }
            // console.log(message);
            console.log(socket.id)
            io.to(parentId).emit(EVENTS.CLIENT.SIGN_IN_OR_OUT,{parentId, message, actionType});

          });
        // Handle disconnection
        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

}

