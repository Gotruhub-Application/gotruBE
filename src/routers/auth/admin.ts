import { Router } from "express";
import { AdminAuth, AdminResetPasswordController } from "../../controllers/auth/admin.controllers";
import { IsAuthenticatedGotruAdmin } from "../../support/middleware";

export const adminAuthRouter = Router()

adminAuthRouter
.post("/sign-up/admin", AdminAuth.createAdminUser)
.post("/sign-in/admin", AdminAuth.login)

.post("/admin/reset-password/get-reset-token", AdminResetPasswordController.getResetToken)
.post("/admin/reset-password/validate-token", AdminResetPasswordController.verifyToken)
.post("/admin/reset-password/change-password", AdminResetPasswordController.changePassword)
.post("/admin/dashboard/change-password", IsAuthenticatedGotruAdmin, AdminResetPasswordController.changePasswordInDashBoard)