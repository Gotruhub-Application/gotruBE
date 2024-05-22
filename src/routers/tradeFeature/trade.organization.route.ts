import {Router} from "express"
import { IsAuthenticatedUser,IsAuthenticatedOrganization } from "../../support/middleware"
import { CartController, Catetgory, Products, WithdrawalRequestController } from "../../controllers/organization/tradeFeatures/organization.trade.controllers";

export const tradeOrganizationRouter = Router();

tradeOrganizationRouter
.post("/category",IsAuthenticatedOrganization,Catetgory.addCategory)
.get("/category",IsAuthenticatedOrganization,Catetgory.getAllCategory)
.get("/category/:id",IsAuthenticatedOrganization,Catetgory.getSingleCategory)
.put("/category/:id",IsAuthenticatedOrganization,Catetgory.updateSingleCategory)
.delete("/category/:id",IsAuthenticatedOrganization,Catetgory.deleteSingleCategory)

// Products
.post("/products",IsAuthenticatedOrganization,Products.addProduct)
.get("/products",IsAuthenticatedOrganization,Products.getAllProducts)
.get("/products/:id",IsAuthenticatedOrganization,Products.getSingleProduct)
.put("/products/:id",IsAuthenticatedOrganization,Products.updateSingleProduct)
.delete("/products/:id",IsAuthenticatedOrganization,Products.deleteSingleProduct)

// withdrawasl
.get("/withdrawals", IsAuthenticatedOrganization, WithdrawalRequestController.getAllWithdrawalRequests)
.get("/withdrawals/:id", IsAuthenticatedOrganization, WithdrawalRequestController.getWithdrawalRequestById)
.put("/withdrawals/:id", IsAuthenticatedOrganization, WithdrawalRequestController.updateWithdrawalRequest)
.post("/checkout", IsAuthenticatedUser, CartController.checkOut)
