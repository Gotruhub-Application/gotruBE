import app from "./app";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Request, Response } from "express"; 
import { logger } from "./logger";
import { authRouter } from "./routers/auth/organization.register";

dotenv.config();
const { MONGO_URL, PORT } = process.env;

logger.info("HEYYsddssYYY");
logger.info(MONGO_URL, "HEYYYYY");

const port = PORT || 8000;
mongoose
    .connect(MONGO_URL ?? "") // Use empty string as fallback value if MONGO_URL is undefined
    .then(() => {
        logger.info("MongoDB is connected successfully");
    })
    .catch((err) => console.error(`Error: ${err}`));

app.listen(port, () => {
    
    logger.info(`server connected on ${port}`);
});
app.use("/", authRouter);

