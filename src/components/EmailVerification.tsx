import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, RefreshCw, CheckCircle, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { Agent } from '../types';
import { EmailService, generateVerificationCode, isCodeExpired } from '../utils/emailService';

interface EmailVerificationProps {
  agent: Agent;
  onVerificationComplete: (agent: Agent) => void;
  onResendCode: (agent: Agent, newCode: string) => void;
  onBackToSignup?: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  agent,
  onVerificationComplete,
  onResendCode,
  onBackToSignup
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    if (verificationCode.length !== 6) {
      setMessage('Please enter a 6-digit verification code');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get stored verification data from localStorage (in real app, this would be from your backend)
      const storedData = localStorage.getItem(`verification_${agent.email}`);
      
      if (!storedData) {
        setMessage('Verification session expired. Please request a new code.');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }

      const { code: storedCode, timestamp } = JSON.parse(storedData);

      // Check if code is expired
      if (isCodeExpired(timestamp)) {
        setMessage('Verification code has expired. Please request a new code.');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }

      // Check if code matches
      if (verificationCode !== storedCode) {
        setMessage('Invalid verification code. Please check and try again.');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }

      // Code is valid - mark agent as verified
      const verifiedAgent: Agent = {
        ...agent,
        isEmailVerified: true,
        emailVerificationToken: undefined
      };

      // Clean up verification data
      localStorage.removeItem(`verification_${agent.email}`);

      setMessage('Email verified successfully! Redirecting to dashboard...');
      setMessageType('success');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        onVerificationComplete(verifiedAgent);
      }, 1500);

    } catch (error) {
      setMessage('Verification failed. Please try again.');
      setMessageType('error');
    }

    setIsSubmitting(false);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setMessage('');

    try {
      // Generate new verification code
      const newCode = generateVerificationCode();
      const timestamp = new Date().toISOString();

      // Store verification data (in real app, this would be in your backend)
      localStorage.setItem(`verification_${agent.email}`, JSON.stringify({
        code: newCode,
        timestamp
      }));

      // Send email via Resend
      const emailSent = await EmailService.sendVerificationEmail({
        email: agent.email,
        code: newCode,
        name: agent.name
      });

      if (emailSent) {
        setMessage('New verification code sent to your email!');
        setMessageType('success');
        setTimeLeft(180); // Reset timer to 3 minutes
        onResendCode(agent, newCode);
      } else {
        setMessage('Failed to send verification email. Please try again.');
        setMessageType('error');
      }

    } catch (error) {
      setMessage('Failed to resend verification code. Please try again.');
      setMessageType('error');
    }

    setIsResending(false);
  };

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-blue-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Back Button */}
          {onBackToSignup && (
            <div className="mb-6">
              <button
                onClick={onBackToSignup}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Sign Up</span>
              </button>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-4">
              We've sent a verification code to
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
              {agent.email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Check your email
                </p>
                <p className="text-sm text-blue-800">
                  Please paste the 6-digit verification code here to verify your account and access your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Code expires in: <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
            </span>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeInput}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Enter the 6-digit code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || verificationCode.length !== 6}
              className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Email</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : messageType === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : messageType === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Mail className="h-5 w-5 text-blue-600" />
                )}
                <p className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 
                  messageType === 'error' ? 'text-red-800' : 'text-blue-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Resend Code */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 120} // Allow resend after 1 minute (180-60=120)
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Resend verification code</span>
                </>
              )}
            </button>
            {timeLeft > 240 && (
              <p className="text-xs text-gray-500 mt-2">
                You can resend in {formatTime(timeLeft - 120)}
              </p>
            )}
          </div>

          {/* Help */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              <strong>Having trouble?</strong> Check your spam folder or contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;