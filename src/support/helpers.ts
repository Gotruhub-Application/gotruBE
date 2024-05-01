import { Token, User, Organization } from "../models/organization.models";
import nodemailer from "nodemailer"
import dotenv from "dotenv"
import fs from "fs"
import handlebars from "handlebars"
import { logger } from "../logger"; 

dotenv.config()


export const generateRandomToken = async function(): Promise<string> {
    let token: any = 0;
    let codeExists = true;
  
    // Generate a new code until a unique one is found
    while (codeExists) {
      token = Math.floor(Math.random() * 9000) + 1000; // Generate a 6-digit random number
      // Check if the generated code already exists in the database
      const existingToken = await Token.findOne({ token: token });
      if (!existingToken) {
        codeExists = false; // Exit the loop if code doesn't exist in the database
      }
    }
  
    return token.toString(); // Convert number to string before returning
  };

export const generateOrganizationDOmainCode = async function(): Promise<string> {
    let token: any = 0;
    let codeExists = true;
  
    // Generate a new code until a unique one is found
    while (codeExists) {
      token = Math.floor(Math.random() * 9000) + 1000; // Generate a 6-digit random number
      // Check if the generated code already exists in the database
      const existingToken = await Organization.findOne({ domain: token });
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

export async function sendOnboardingMail(role:string, email:string, subject:string,template:string, context:object): Promise<boolean>{
    if(role === "student"){
        return false
    }
    await sendTemplateMail(email,subject,template, context)
    return true;
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


export function generateRandomPassword(length: number): string {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericChars = '0123456789';
    const specialChars = '!@#$%^&*';
  
    const allChars = lowercaseChars + uppercaseChars + numericChars + specialChars;
  
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }
  
    return password;
  }

export function writeErrosToLogs(error:any) {
    logger.error(`Error in login at line ${error.name}: ${error.message}\n${error.stack}`);
}