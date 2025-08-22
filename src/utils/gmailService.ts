// Modern EmailJS Email service using official @emailjs/browser package
import emailjs from '@emailjs/browser';

export interface EmailVerificationData {
  email: string;
  code: string;
  name: string;
}

export class GmailService {
  // Direct EmailJS Configuration
  private static readonly EMAILJS_CONFIG = {
    serviceId: 'service_s8pgwr9',
    templateId: 'template_57mri08',
    publicKey: 'vl_eYgF3id2F3WDmX'
  };

  static async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      console.log('📧 Sending email via EmailJS with official SDK...');
      
      // Initialize EmailJS with public key
      emailjs.init(this.EMAILJS_CONFIG.publicKey);
      console.log('✅ EmailJS initialized with public key');

      // Send email via EmailJS
      const result = await emailjs.send(
        this.EMAILJS_CONFIG.serviceId, 
        this.EMAILJS_CONFIG.templateId, 
        {
          FullName: data.name,
          Email: data.email,
          VerificationCode: data.code,
          to_email: data.email,
          to_name: data.name,
          verification_code: data.code,
          from_name: 'Lagos Affordable Homes Team',
          subject: 'Verify your Lagos Affordable Homes account'
        }
      );
      
      console.log(`✅ Email sent successfully to ${data.email} via EmailJS`, result);
      return true;
      
    } catch (error) {
      console.error('❌ EmailJS sending error:', error);
      return false;
    }
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
  
  return (currentTime - threeMinutes) > codeTime;
};