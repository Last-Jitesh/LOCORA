import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT),
  secure: Number(env.EMAIL_PORT) === 465,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 15000,     // 15 seconds
});

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Your Locora sign-in code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin:0;padding:0;background:#0F0A04;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:40px auto;background:#1A1208;border-radius:16px;border:1px solid rgba(200,148,26,0.2);overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(180deg,#1A1208,#0F0A04);">
                <p style="color:#C8941A;font-size:22px;font-weight:700;letter-spacing:2px;margin:0 0 4px;">LOCORA</p>
                <p style="color:#8B7050;font-size:12px;margin:0;">your neighbourhood</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 8px;">
                <p style="color:#F5E6C8;font-size:18px;font-weight:600;margin:0 0 8px;">Your sign-in code</p>
                <p style="color:#C8A96E;font-size:14px;line-height:1.5;margin:0 0 24px;">
                  Use this code to sign in to Locora. It expires in <strong>5 minutes</strong>.
                </p>
                <div style="background:#0F0A04;border:1px solid rgba(200,148,26,0.3);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                  <span style="color:#C8941A;font-size:40px;font-weight:700;letter-spacing:12px;font-family:monospace;">${otp}</span>
                </div>
                <p style="color:#8B7050;font-size:12px;line-height:1.5;margin:0;">
                  If you didn't request this, you can safely ignore this email. Never share this code with anyone.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 28px;border-top:1px solid rgba(200,148,26,0.1);">
                <p style="color:#8B7050;font-size:11px;text-align:center;margin:0;">
                  © Locora — The Social Layer of Every Neighbourhood
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err: any) {
    console.error('⚠️ SMTP email sending error:', err.message || err);
  }
};

