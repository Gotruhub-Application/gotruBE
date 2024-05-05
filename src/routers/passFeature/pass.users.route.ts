import {Router} from "express"
import { ParentManageRelatedAccounts } from "../../controllers/organization/passFeatures/pass.parents..controllers"
import { IsAuthenticatedUser } from "../../support/middleware"

export const passFeatureUserRouter = Router()

.get("/my-related-accounts", IsAuthenticatedUser,ParentManageRelatedAccounts.getAllRelatedAccount)
.get("/child/:id/pass/history", IsAuthenticatedUser,ParentManageRelatedAccounts.getAllSIngleRelatedAccountPassHistory)