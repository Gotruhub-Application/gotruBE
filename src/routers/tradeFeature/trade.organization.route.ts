import {Router} from "express"
import { IsAuthenticatedUser,IsAuthenticatedOrganization, IsAuthenticatedStaff } from "../../support/middleware"
import { CartController, Catetgory, OrderController, Products, WithdrawalRequestController } from "../../controllers/organization/tradeFeatures/organization.trade.controllers";
import { UserSummary } from "../../controllers/organization.controller";

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
.post("/checkout", IsAuthenticatedStaff, CartController.checkOut)
.get("/trade-summary", IsAuthenticatedOrganization, UserSummary.orgzTradeSummary)

// 
.get('/child/:child_id/orders',IsAuthenticatedUser, OrderController.getUserOrders)
.get('/admin/orders', IsAuthenticatedOrganization,OrderController.getAllOrders)
.get('/child/:child_id/orders/:orderId',IsAuthenticatedUser, OrderController.getUserOrderById)
.get('/admin/orders/:orderId',IsAuthenticatedOrganization, OrderController.getAdminOrderById)
.put('/admin/orders/:orderId',IsAuthenticatedOrganization, OrderController.updateOrderStatus)
.delete('/admin/orders/:orderId',IsAuthenticatedOrganization, OrderController.deleteOrder)


// user's copy
.get("/mobile-section/category",IsAuthenticatedUser,Catetgory.getAllCategory)
.get("/mobile-section/category/:id",IsAuthenticatedUser,Catetgory.getSingleCategory)

// Products
.get("/mobile-section/products",IsAuthenticatedUser,Products.getAllProducts)
.get("/mobile-section/products/:id",IsAuthenticatedUser,Products.getSingleProduct)

// withdrawasl
.post("/mobile-section/checkout", IsAuthenticatedUser, CartController.checkOut)

// 
.get('/mobile-section/child/:child_id/orders',IsAuthenticatedUser, OrderController.getUserOrders)
.get('/mobile-section/admin/orders', IsAuthenticatedStaff,OrderController.getAllOrders)
.get('/mobile-section/child/:child_id/orders/:orderId',IsAuthenticatedUser, OrderController.getUserOrderById)

