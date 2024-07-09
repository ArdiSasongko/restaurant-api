import nodemailer from 'nodemailer';

export class SendEmail {
    private static initialUser() {
        return nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "luckeyf0rluck@gmail.com",
                pass: Bun.env.NODEMAILER_PASS
            }
        })
    }

    static async sendEmail(data: { email: string, subject: string, otp: string, date: Date }) {
        try {
            const transporter = this.initialUser()
            const htmlContent = `
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Send Token</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                        }
                        .container {
                            max-width: 600px;
                            margin: auto;
                            background: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            padding-bottom: 20px;
                            border-bottom: 1px solid #eaeaea;
                        }
                        .header img {
                            max-width: 100px;
                        }
                        .content {
                            padding: 20px 0;
                            text-align: center;
                        }
                        .content h2 {
                            color: #0044cc;
                            margin-top: 0;
                        }
                        .content p {
                            margin: 10px 0;
                        }
                        .otp {
                            display: inline-block;
                            background-color: #ffff00;
                            padding: 10px 20px;
                            font-size: 1.2em;
                            font-weight: bold;
                            border-radius: 4px;
                        }
                        .footer {
                            margin-top: 20px;
                            text-align: center;
                            font-size: 0.8em;
                            color: #888;
                            border-top: 1px solid #eaeaea;
                            padding-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="logo-url.png" alt="Company Logo">
                        </div>
                        <div class="content">
                            <h2>${data.subject}</h2>
                            <p>Your Token:</p>
                            <p class="otp">${data.otp}</p>
                            <p>Valid until: ${data.date}</p>
                        </div>
                        <div class="footer">
                            <p>If you did not request this token, please ignore this email.</p>
                            <p>© {{new Date().getFullYear()}} Company Name. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
            const info = await transporter.sendMail({
                from: 'luckeyf0rluck@gmail.com',
                to: data.email,
                subject: data.subject,
                html: htmlContent,
            });

            console.log("Message sent: %s", info.messageId);

        } catch (error: any) {
            console.error(error.message);
        }
    }
}