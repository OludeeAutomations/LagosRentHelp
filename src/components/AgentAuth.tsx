import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { Agent } from '../types';
import { GmailService, generateVerificationCode } from '../utils/gmailService';
import EmailVerification from './EmailVerification';

interface AgentAuthProps {
  onLogin: (agent: Agent) => void;
  onRegister: (agentData: Omit<Agent, 'id' | 'registeredAt' | 'referralCode'>) => void;
  onBack?: () => void;
}

const AgentAuth: React.FC<AgentAuthProps> = ({ onLogin, onRegister, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showVerificationSent, setShowVerificationSent] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<Agent | null>(null);
  
  // Load saved agents from localStorage
  const [savedAgents, setSavedAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem('lagosrentals_saved_agents');
      const agents = saved ? JSON.parse(saved) : [];
      console.log('=== INITIAL LOAD DEBUG ===');
      console.log('Loaded saved agents:', agents);
      return agents;
    } catch (error) {
      console.error('Error loading saved agents:', error);
      return [];
    }
  });
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsappNumber: ''
  });

  const generateReferralCode = (name: string, email: string): string => {
    const nameCode = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    const emailCode = email.split('@')[0].substring(0, 4).toUpperCase();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${nameCode}${emailCode}${randomCode}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Debug: Check what's in localStorage
      console.log('=== LOGIN DEBUG ===');
      console.log('Attempting login with:', { email: loginForm.email, password: loginForm.password });
      console.log('Saved agents in localStorage:', savedAgents);
      console.log('Raw localStorage data:', localStorage.getItem('lagosrentals_saved_agents'));
      
      // Find agent in saved agents
      const existingAgent = savedAgents.find(agent => 
        agent.email === loginForm.email && agent.password === loginForm.password
      );
      
      console.log('Found agent:', existingAgent);
      
      if (existingAgent) {
        setMessage('Login successful! Redirecting to dashboard...');
        setMessageType('success');
        
        // Reset form
        setLoginForm({ email: '', password: '' });
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          onLogin(existingAgent);
        }, 1000);
        onLogin(existingAgent);
      } else {
        setMessage(`Invalid email or password. Found ${savedAgents.length} saved agents. Please check your credentials or sign up if you don't have an account.`);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Login failed. Please check your credentials.');
      setMessageType('error');
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    // Check if email already exists
    const existingAgent = savedAgents.find(agent => agent.email === registerForm.email);
    if (existingAgent) {
      setMessage('This email already has an account. Please login instead or use a different email address.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    // Validate email is not empty
    if (!registerForm.email || registerForm.email.trim() === '') {
      setMessage('Email address is required');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate verification code
      const verificationCode = generateVerificationCode();
      const timestamp = new Date().toISOString();
      
      // Store verification data (in real app, this would be in your backend)
      localStorage.setItem(`verification_${registerForm.email}`, JSON.stringify({
        code: verificationCode,
        timestamp
      }));
      
      // Send verification email automatically via Gmail SMTP
      const emailSent = await GmailService.sendVerificationEmail({
        email: registerForm.email,
        code: verificationCode,
        name: registerForm.name
      });
      
      if (!emailSent) {
        setMessage('Failed to send verification email. Please check your internet connection and try again.');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }
      
      const newAgent = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        whatsappNumber: registerForm.whatsappNumber,
        isEmailVerified: false,
        listings: [],
        freeListingsUsed: 0,
        referralCount: 0,
        freeListingsFromReferrals: 0,
        totalLeads: 0,
        totalReferralClicks: 0,
        status: 'trial' as const,
        trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Store pending agent and show verification
      setPendingAgent(newAgent);
      setShowVerification(true);
      
      // Reset form
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        whatsappNumber: ''
      });
    } catch (error) {
      setMessage('Registration failed. Please check your details and try again.');
      setMessageType('error');
    }
    
    setIsSubmitting(false);
  };

  const handleVerificationComplete = (verifiedAgent: Agent) => {
    console.log('=== VERIFICATION COMPLETE DEBUG ===');
    console.log('Verified agent:', verifiedAgent);
    
    // Update the saved agents state to reflect the new agent
    const currentSavedAgents = JSON.parse(localStorage.getItem('lagosrentals_saved_agents') || '[]');
    setSavedAgents(currentSavedAgents);
    
    // Also call onRegister to update the main app state
    onRegister(verifiedAgent);
    
    // Set as current agent for immediate login
    onLogin(verifiedAgent);
  };

  const handleResendCode = (agent: Agent, newCode: string) => {
    // Update the stored verification code
    const timestamp = new Date().toISOString();
    localStorage.setItem(`verification_${agent.email}`, JSON.stringify({
      code: newCode,
      timestamp
    }));
  };

  const handleBackToSignup = () => {
    setShowVerification(false);
    setPendingAgent(null);
    setMessage('');
  };

  // Show verification page if needed
  if (showVerification && pendingAgent) {
    return (
      <EmailVerification
        agent={pendingAgent}
        onVerificationComplete={handleVerificationComplete}
        onResendCode={handleResendCode}
        onBackToSignup={handleBackToSignup}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-blue-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Back Button */}
          {onBack && (
            <div className="mb-6">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Home</span>
              </button>
            </div>
          )}
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Agent Login' : 'Join as Agent'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Access your dashboard' : 'Start listing properties today'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Forms */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={registerForm.whatsappNumber}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+234XXXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl border ${
              messageType === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p className={`text-sm font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
              
              {showVerificationSent && messageType === 'success' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Next step:</strong> Check your email and paste the 6-digit verification code to access your dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
            </p>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentAuth;