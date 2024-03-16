import express, {Application, Express, Request, Response, NextFunction} from "express"
import cors from "cors"
import { failedResponse } from "./support/http"; 
import { httpLogger } from "./httpLogger";
import { authRouter } from "./routers/auth/organization.register";
import bodyParser from "body-parser"

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
app.use("/", authRouter)
app.get("/", (req: Request, res: Response) => {
    res.send("welcome to express and typescript");
});
app.use((req:Request, res:Response, next:NextFunction)=>{
    failedResponse(res, 404, `Invalid endpoint, inspect url again.`)
})

export default app;