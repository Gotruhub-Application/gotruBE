import { ParentManageWallet, ParentWithdrawalRequestController } from "../../controllers/parents/wallet";
import { IsAuthenticatedUser } from "../../support/middleware";
import { organizationRouter } from "../organization.router";

organizationRouter
.get("/wallet/:child_id", IsAuthenticatedUser, ParentManageWallet.getChildWallet)
.get("/wallet/:child_id/transactions", IsAuthenticatedUser,ParentManageWallet.getChildWalletTransaction)
.put("/wallet/:child_id/change-pin",IsAuthenticatedUser, ParentManageWallet.updateChildWalletPin)
.post("/wallet/:child_id/fund",IsAuthenticatedUser, ParentManageWallet.fundChildWallet)
.get("/wallet/get/withdrawal-account", IsAuthenticatedUser,ParentManageWallet.getWithdrawalAccount)
.put("/wallet/update/withdrawal-account", IsAuthenticatedUser,ParentManageWallet.updateWithdrawalAccount)
.post("/wallet/:child_id/request-withdrawal", IsAuthenticatedUser, ParentWithdrawalRequestController.createWithdrawalRequest)
.get("/wallet/:wallet_id/withdrawals", IsAuthenticatedUser, ParentWithdrawalRequestController.getAllWithdrawalRequests)
