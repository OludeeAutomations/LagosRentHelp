// Email service using Resend API
export interface EmailVerificationData {
  email: string;
  code: string;
  name: string;
}

export class EmailService {
  private static readonly RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
  private static readonly API_URL = 'https://api.resend.com/emails';
  private static readonly FROM_EMAIL = 'Lagos Rent Help <noreply@lagosrenthelp.ng>';

  static async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      // Check if API key is configured
      if (!this.RESEND_API_KEY || this.RESEND_API_KEY === 'your_resend_api_key_here') {
        console.error('Resend API key is not configured. Please set VITE_RESEND_API_KEY in your .env file');
        return false;
      }

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.FROM_EMAIL,
          to: data.email,
          subject: 'Verify your Lagos Rent Help account',
          html: this.getVerificationEmailTemplate(data.name, data.code),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to send email. Status:', response.status, 'Error:', errorText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email service error - this usually means the API key is missing or invalid:', error);
      return false;
    }
  }

  private static getVerificationEmailTemplate(name: string, code: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your Lagos Rent Help account</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏠 Lagos Rent Help</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Your trusted rental platform</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Lagos Rent Help, ${name}!</h2>
            
            <p style="margin-bottom: 25px; font-size: 16px;">
              Thank you for joining our platform. To complete your registration and access your agent dashboard, please verify your email address.
            </p>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #6b7280;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="margin-bottom: 20px; font-size: 16px;">
              Paste this code on the verification screen to access your dashboard and start listing properties.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>⏰ Important:</strong> This code will expire in 3 minutes for security reasons.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              If you didn't create an account with Lagos Rent Help, please ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">Lagos Rent Help - Connecting Lagosians to affordable rental homes</p>
              <p style="margin: 5px 0 0 0;">Lagos, Nigeria</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

// Generate 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if verification code is expired (5 minutes)
export const isCodeExpired = (timestamp: string): boolean => {
  const codeTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
  
  return (currentTime - codeTime) > threeMinutes;
};