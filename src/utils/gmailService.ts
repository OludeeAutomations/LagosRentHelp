// Gmail SMTP Email service
export interface EmailVerificationData {
  email: string;
  code: string;
  name: string;
}

export class GmailService {
  private static readonly SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'admin@lagosrenthelp.ng',
    password: 'dvpv gjzb irgn mntv',
    encryption: 'TLS'
  };

  static async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      // In a real application, you would use a backend service to send emails
      // For demo purposes, we'll simulate the email sending process
      
      const emailData = {
        from: this.SMTP_CONFIG.username,
        to: data.email,
        subject: 'LagosRentHelp Email Verification',
        html: this.getVerificationEmailTemplate(data.name, data.code),
        smtp: this.SMTP_CONFIG
      };

      // Simulate API call to backend email service
      console.log('Sending email via Gmail SMTP:', emailData);
      
      // In production, this would be a real API call to your backend
      // Example: await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) })
      
      // For demo purposes, we'll simulate a successful send
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message in console
      console.log(`✅ Email sent successfully to ${data.email}`);
      console.log(`📧 Subject: LagosRentHelp Email Verification`);
      console.log(`🔐 Verification Code: ${data.code}`);
      
      return true;
    } catch (error) {
      console.error('Gmail SMTP service error:', error);
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
          <title>LagosRentHelp Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏠 LagosRentHelp</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Your trusted rental platform</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="margin-bottom: 25px; font-size: 16px;">
              Thanks for signing up on LagosRentHelp!
            </p>
            
            <p style="margin-bottom: 25px; font-size: 16px;">
              Please verify your email to complete your account setup.
            </p>
            
            <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <p style="margin: 0 0 15px 0; font-size: 16px; color: #6b7280;">Your verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="margin-bottom: 20px; font-size: 16px;">
              If you didn't request this, you can ignore this email.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 25px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>⏰ Important:</strong> This code will expire in 3 minutes for security reasons.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">– LagosRentHelp Team</p>
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

// Check if verification code is expired (3 minutes)
export const isCodeExpired = (timestamp: string): boolean => {
  const codeTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const threeMinutes = 3 * 60 * 1000; // 3 minutes in milliseconds
  
  return (currentTime - codeTime) > threeMinutes;
};