import { Token } from "../models/organization.models";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import fs from "fs"
import handlebars from "handlebars"

dotenv.config()


export const generateRandomToken = async function(): Promise<string> {
    let token: any = 0;
    let codeExists = true;
  
    // Generate a new code until a unique one is found
    while (codeExists) {
      token = Math.floor(Math.random() * 900000) + 100000; // Generate a 6-digit random number
      // Check if the generated code already exists in the database
      const existingToken = await Token.findOne({ token: token });
      if (!existingToken) {
        codeExists = false; // Exit the loop if code doesn't exist in the database
      }
    }
  
    return token.toString(); // Convert number to string before returning
  };

export async function OtpToken(email:string,subject:string="Otp Token", template:string): Promise<any>{
    const otp = await Token.findOne({email:email});
    const expiryDate= new Date()
    expiryDate.setMinutes(expiryDate.getMinutes() + 10);
    const token =await generateRandomToken();
    if (!otp){
        // new_date=date.n
        const newOtp = await  Token.create({
            email:email,
            token: token,
            expires_at: expiryDate
        })

    }else{
        otp.expires_at =expiryDate;
        otp.token =token,
        await otp.save()


    }
    // send mail
    await sendTemplateMail(email,subject,template, {email:email,token:token})
}

export async function verifyToken(email:string, token:string): Promise<boolean> {
    const isEmailToken = await Token.findOne({email:email, token:token})
    const currentTime : Date= new Date()
    if (!isEmailToken){
        return false
    }
    if (isEmailToken.expires_at < currentTime){
        return false
    }else{
        const expiryDate= new Date()
        expiryDate.setMinutes(expiryDate.getMinutes() + 10);
        isEmailToken.token= await generateRandomToken()
        isEmailToken.expires_at= expiryDate
        await isEmailToken.save()
        return true
    }

    
}

export async function ValidateToken(email:string, token:string): Promise<boolean> {
    const isEmailToken = await Token.findOne({email:email, token:token})
    const currentTime : Date= new Date()
    if (!isEmailToken){
        return false
    }
    if (isEmailToken.expires_at < currentTime){
        return false
    }else{
        return true
    }
}


const transporter = nodemailer.createTransport({
    service: 'gmail', // Update with your email service provider
    auth: {
        user: process.env.username, // Update with your email address
        pass: process.env.pass, // Update with your email password
    },
});

const sentMail = async (to:string, subject:string, html:string)=>{
    await transporter.sendMail({
        from: process.env.username, // Update with your email address
        to: to,
        subject: subject,
        html: html,
    });
}

export const sendTemplateMail = async (email: string, subject: string, templatePath:string, context:object) => {
    // Read the HTML template file
    const html = fs.readFileSync(templatePath, 'utf8');

    // Compile the template
    const template = handlebars.compile(html);

    // Render the template with dynamic data
    const compiledHtml = template(context);

    // Send the email
    await sentMail(email, subject , compiledHtml);
};
