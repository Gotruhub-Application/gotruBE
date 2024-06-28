import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config()


export const generateJwtToken =(payload:object): string =>{
    
    const token = jwt.sign(payload, `${process.env.TOKEN_KEY}`, {expiresIn: "34567d"});
    return token;
}

export const verifyJwtToken = (token:string): any =>{
    try {
        const decode = jwt.verify(token, `${process.env.TOKEN_KEY}`)
        return decode
    } catch (error) {
        throw new Error("Invalid token")
        
    }
}