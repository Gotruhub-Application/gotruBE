import { Router } from "express";
import { CompleteOnboarding, UserResetPasswordController } from "../../controllers/auth/users.auth";
import { IsAuthenticatedNewUser, IsAuthenticatedUser } from "../../support/middleware";

export const userAuthRouter = Router()

userAuthRouter
.post("/login", CompleteOnboarding.onbaord)
.post("/change-password", IsAuthenticatedNewUser,CompleteOnboarding.createPassword)

.post("/user/reset-password/get-reset-token", UserResetPasswordController.getResetToken)
.post("/user/reset-password/validate-token", UserResetPasswordController.verifyToken)
.post("/user/reset-password/change-password", UserResetPasswordController.changePassword)