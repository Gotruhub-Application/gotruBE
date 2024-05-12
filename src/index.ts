import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response } from "express"; 
import { logger } from "./logger";
import { authRouter } from "./routers/auth/organization.register";

// socket.io
import { createServer } from "http";
import { Server } from "socket.io";
import { socket } from "./socket";
import { scheduleTokenExpirationCheck } from "./support/helpers";

const httpServer = createServer(app);

// const io = new Server(httpServer);

export const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

dotenv.config();
const { MONGO_URL, PORT } = process.env;

const port = PORT || 8000;

httpServer.listen(PORT, () => {
    logger.info(`server connected on ${port}`);
    socket();
    // cron jobs
    scheduleTokenExpirationCheck()
  });