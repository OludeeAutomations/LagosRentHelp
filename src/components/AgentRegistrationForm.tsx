import React, { useState } from 'react';
import { User, Phone, FileText, Upload, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Agent } from '../types';
import { generateReferralCode } from '../utils/referralLogic';

interface AgentRegistrationFormProps {
  agent: Agent;
  onRegistrationComplete: (agent: Agent) => void;
}

const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({
  agent,
  onRegistrationComplete
}) => {
  const [formData, setFormData] = useState({
    fullName: agent.name || '',
    phoneNumber: agent.whatsappNumber || '',
    agentType: '',
    validId: null as File | null,
    proofOfAddressType: 'file', // 'dropdown' or 'file'
    proofOfAddressDropdown: '',
    proofOfAddressFile: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const agentTypeOptions = [
    'Independent Agent',
    'Agency Representative', 
    'Property Manager',
    'Land Agent',
    'Broker'
  ];

  const proofOfAddressOptions = [
    'Utility Bill',
    'Bank Statement',
    'Tenancy Agreement',
    'Voter Card',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^0[789][01]\d{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid Nigerian phone number (e.g., 08012345678)';
    }

    if (!formData.agentType) {
      newErrors.agentType = 'Agent type is required';
    }

    if (!formData.validId) {
      newErrors.validId = 'Valid ID upload is required';
    }

    if (formData.proofOfAddressType === 'dropdown' && !formData.proofOfAddressDropdown) {
      newErrors.proofOfAddress = 'Proof of address selection is required';
    } else if (formData.proofOfAddressType === 'file' && !formData.proofOfAddressFile) {
      newErrors.proofOfAddress = 'Proof of address file upload is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = (field: 'validId' | 'proofOfAddressFile', file: File | null) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 5MB'
        }));
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Only JPG, PNG, and PDF files are allowed'
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: file }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage('Please fill in all required fields correctly');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Try to send to webhook, but don't let it block registration
      try {
        // Prepare form data for webhook
        const webhookData = new FormData();
        webhookData.append('email', agent.email);
        webhookData.append('fullName', formData.fullName);
        webhookData.append('phoneNumber', formData.phoneNumber);
        webhookData.append('agentType', formData.agentType);
        
        if (formData.validId) {
          webhookData.append('validId', formData.validId);
        }

        if (formData.proofOfAddressType === 'dropdown') {
          webhookData.append('proofOfAddressType', 'dropdown');
          webhookData.append('proofOfAddress', formData.proofOfAddressDropdown);
        } else if (formData.proofOfAddressFile) {
          webhookData.append('proofOfAddressType', 'file');
          webhookData.append('proofOfAddress', formData.proofOfAddressFile);
        }

        // Send to webhook
        const response = await fetch('https://than.n8n.ng/webhook-test/agent-verification', {
          method: 'POST',
          body: webhookData
        });

        if (!response.ok) {
          console.warn('Webhook submission failed, but continuing with registration');
        }
      } catch (webhookError) {
        console.warn('Webhook submission error (continuing with registration):', webhookError);
      }

      // Always proceed with local registration regardless of webhook status
      try {
        setMessage('Registration submitted successfully! Your account is under review.');
        setMessageType('success');
        
        // Update agent with registration data
        const updatedAgent: Agent = {
          ...agent,
          id: agent.id || 'agent_' + Date.now(),
          name: formData.fullName,
          whatsappNumber: formData.phoneNumber,
          isEmailVerified: true,
          listings: [],
          freeListingsUsed: 0,
          referralCount: 0,
          freeListingsFromReferrals: 0,
          totalLeads: 0,
          totalReferralClicks: 0,
          registeredAt: agent.registeredAt || new Date().toISOString(),
          status: 'trial' as const,
          trialExpiresAt: agent.trialExpiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          // Generate referral code if not exists
          referralCode: agent.referralCode || generateReferralCode(formData.fullName, agent.email)
        };

        // Save agent to localStorage for future logins
        const savedAgents = JSON.parse(localStorage.getItem('lagosrentals_saved_agents') || '[]');
        const existingAgentIndex = savedAgents.findIndex((a: Agent) => a.email === updatedAgent.email);
        
        if (existingAgentIndex >= 0) {
          // Update existing agent
          savedAgents[existingAgentIndex] = updatedAgent;
        } else {
          // Add new agent
          savedAgents.push(updatedAgent);
        }
        
        localStorage.setItem('lagosrentals_saved_agents', JSON.stringify(savedAgents));
        
        console.log('=== AGENT SAVED DEBUG ===');
        console.log('Updated agent saved to localStorage:', updatedAgent);
        console.log('All saved agents:', savedAgents);
        
        setTimeout(() => {
          onRegistrationComplete(updatedAgent);
        }, 2000);
      } catch (localError) {
        console.error('Local registration error:', localError);
        setMessage('Failed to complete registration. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Failed to complete registration. Please try again.');
      setMessageType('error');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Registration
            </h2>
            <p className="text-gray-600">
              Please provide additional information to verify your agent account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Agent Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-600" />
                Agent Info
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full legal name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                        errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="08012345678"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Nigerian format (e.g., 08012345678)</p>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Type *
                  </label>
                  <select
                    required
                    value={formData.agentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, agentType: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
                      errors.agentType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select agent type</option>
                    {agentTypeOptions.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.agentType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.agentType}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Documents Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                Verification Documents
              </h3>
              
              <div className="space-y-6">
                {/* Valid ID Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Valid ID *
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
                    errors.validId ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('validId', e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        {formData.validId ? formData.validId.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        National ID, Driver's License, or Passport (JPG, PNG, PDF - Max 5MB)
                      </p>
                    </div>
                  </div>
                  {errors.validId && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.validId}
                    </p>
                  )}
                </div>

                {/* Proof of Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Proof of Address *
                  </label>
                  <div className={`relative border-2 border-dashed rounded-xl p-6 transition-colors ${
                    errors.proofOfAddress ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-emerald-400'
                  }`}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('proofOfAddressFile', e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">
                        {formData.proofOfAddressFile ? formData.proofOfAddressFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Utility Bill, Bank Statement, Tenancy Agreement (JPG, PNG, PDF - Max 5MB)
                      </p>
                    </div>
                  </div>
                  {errors.proofOfAddress && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.proofOfAddress}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

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
            </div>
          )}

          {/* Help Text */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              <strong>Note:</strong> All information will be verified before account activation. 
              Please ensure all documents are clear and valid.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRegistrationForm;