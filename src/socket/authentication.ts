import { verifyJwtToken } from "../support/generateTokens";
import { logger } from "../logger";

export function authenticate(socket: any, next: any) {
    const token = socket.handshake.headers.token;
    if (!token) {
        logger.info("heheheheheh");
        return next(new Error("Authentication error"));
    }
    try {
        const decoded = verifyJwtToken(token);
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
}
