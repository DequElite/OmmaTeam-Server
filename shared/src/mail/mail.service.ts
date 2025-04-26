import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer"

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT), 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_KEY,
            }
        });
    }

    public async sendMail(to:string, subject:string, html:string) {
        try{
            await this.transporter.sendMail({
                from:process.env.EMAIL_USER,
                to,
                subject,
                html
            })
            console.log("Email sent success");
        } catch (error) {
            console.error("Error at sending email: ", error);
        }
    }
}
