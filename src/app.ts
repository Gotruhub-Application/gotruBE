import express, {Application, Express, Request, Response, NextFunction} from "express"
import cors from "cors"
import { failedResponse } from "./support/http"; 
import { httpLogger } from "./httpLogger";
import { authRouter } from "./routers/auth/organization.register";
import { adminRouter } from "./routers/admin.routers";
import bodyParser from "body-parser"
import Database from './db'
import { organizationRouter } from "./routers/organization.router";

const app:Application = express();

app.use(
    cors({
       origin: "*",
       methods:['GET',"POST","PUT","DELETE"],
       credentials:true,
    })
)

app.use(httpLogger)

app.use(bodyParser.urlencoded({ extended: true , limit: '50mb'}));
app.use(express.static('./uploads'))
app.use(express.json())


// CONNECT TO DB 
if (process.env.PROJ_ENV === 'DEV' || process.env.PROJ_ENV === 'PRODUCTION') {
    Database.getInstance()
 }
app.use("/", authRouter)
app.use("/", adminRouter);
app.use("/", organizationRouter);

app.get("/", (req: Request, res: Response) => {
    res.send({message:"welcome to express and typescript"});
});
app.use((req:Request, res:Response, next:NextFunction)=>{
    failedResponse(res, 404, `Invalid endpoint, inspect url again.`)
})

export default app;