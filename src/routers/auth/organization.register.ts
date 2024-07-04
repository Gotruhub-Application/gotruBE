import { Router } from "express";
import { OrganizationProfile, OrganizationSignup, ResetPasswordController, login, resendToken, setPassword, verifyOrgAccount } from "../../controllers/auth/organization.register";
import { IsAuthenticatedOrganization, upload } from "../../support/middleware";
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
.post("/login/organization",login)
.post("/set-password", setPassword)
.post("/reset-password/get-reset-token", ResetPasswordController.getResetToken)
.post("/reset-password/validate-token", ResetPasswordController.verifyToken)
.post("/reset-password/change-password", ResetPasswordController.changePassword)
.post("/reset-password/dashboard/change-password",IsAuthenticatedOrganization, ResetPasswordController.changePasswordInDashBoard)
.get("/profile/get-profile", IsAuthenticatedOrganization,OrganizationProfile.getProfile)
.put("/profile/update-profile", IsAuthenticatedOrganization,OrganizationProfile.UpdateProfile)
.delete("/profile/delete-account", IsAuthenticatedOrganization,OrganizationProfile.DeleteMyAccount)
