import { io } from "../index";
import { logger } from "../logger";
import {EVENTS} from "../socket"

export function handleConnection(socket: any) {
    socket.join(socket.user._id);
    logger.info(socket.user);

    io.to(socket.user._id).emit("hello", `welcome ${socket.id}`);

    socket.on("disconnect", () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
    socket.on(EVENTS.CLIENT.SEND_PARENT_SIGN_IN_OUT_MESSAGE, (message:any) => {
        logger.info(`Client disconnected: ${socket.id}, ${message.name}`);
    });
    

}
