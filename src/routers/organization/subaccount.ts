import { SubaccountController } from "../../controllers/organization.controller";
import { IsAuthenticatedOrganization } from "../../support/middleware";
import { organizationRouter } from "../organization.router";

organizationRouter
.post("/bank", IsAuthenticatedOrganization,SubaccountController.createSubaccount)
.get("/bank", IsAuthenticatedOrganization,SubaccountController.getSubaccount)
.put("/bank", IsAuthenticatedOrganization,SubaccountController.updateSubaccount)