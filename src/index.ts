import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response } from "express"; 
import { logger } from "./logger";
import { authRouter } from "./routers/auth/organization.register";

dotenv.config();
const { MONGO_URL, PORT } = process.env;

const port = PORT || 8000;

app.listen(port, () => {
    
    logger.info(`server connected on ${port}`);
});

