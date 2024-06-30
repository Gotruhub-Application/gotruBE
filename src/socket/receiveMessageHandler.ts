// receiveMessageHandler.ts
import { io } from "../index";
import { logger } from "../logger";

export async function handleReceiveMessage(socket: any, message: any) {
    logger.info(`Received message: ${message}`);
    // Your logic for receiving a message
    
}
