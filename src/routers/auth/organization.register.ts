import { Router } from "express";
import { OrganizationSignup, resendToken, verifyOrgAccount } from "../../controllers/auth/organization.register";
import { upload } from "../../support/middleware";
import { UploadFile, allMedia } from "../../controllers/media.controllers";
import { handlefileUpload } from "../../support/middleware";

const regFile = upload.fields([{ name: 'opLicenceImage', maxCount: 1 }, { name: 'cacImage', maxCount: 1 }])
const uploadMedia = upload.single('file')

export const authRouter = Router();

authRouter
.post("/signup/organization",OrganizationSignup)
.post("/resend-token", resendToken)
.post("/verify-account", verifyOrgAccount)
.post("/upload-media", uploadMedia,handlefileUpload, UploadFile)
.get("/all-media", allMedia)

