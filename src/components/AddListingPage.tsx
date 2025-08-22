import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import AgentAuth from './AgentAuth';
import EmailVerification from './EmailVerification';
import AgentDashboard from './AgentDashboard';
import { Agent, Property } from '../types';
import { generateReferralCode, processReferralSignup, extractReferralCode } from '../utils/referralLogic';
import { updateAgentStatus } from '../utils/trialLogic';

interface AddListingPageProps {
  currentAgent: Agent | null;
  onAgentRegister: (agent: Omit<Agent, 'id' | 'registeredAt'>) => void;
  onAddListing: (listing: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateAgent: (agent: Agent) => void;
  onClearCurrentAgent: () => void;
}

const AddListingPage: React.FC<AddListingPageProps> = ({
  currentAgent,
  onAgentRegister,
  onAddListing,
  onUpdateAgent,
  onClearCurrentAgent
}) => {
  // Mock data for demo
  const mockLeads = [];
  const mockNotifications = [];

  const handleLogin = (agent: Agent) => {
    // Update the current agent in the main app state
    const updatedAgent = updateAgentStatus(agent);
    onUpdateAgent(updatedAgent);
  };

  const handleRegister = (agentData: Omit<Agent, 'id' | 'registeredAt' | 'referralCode'>) => {
    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Check for referral code in URL
    const referralCode = extractReferralCode();
    
    const newAgent: Agent = {
      ...agentData,
      id: 'agent_' + Date.now(),
      registeredAt: now.toISOString(),
      referralCode: generateReferralCode(agentData.name, agentData.email),
      trialExpiresAt: trialExpiry.toISOString()
    };

    onAgentRegister(newAgent);
  };

  const handleVerificationComplete = (verifiedAgent: Agent) => {
    onUpdateAgent(verifiedAgent);
  };

  const handleResendCode = (agent: Agent, newCode: string) => {
    const updatedAgent = {
      ...agent,
      verificationCode: newCode,
      verificationCodeTimestamp: new Date().toISOString()
    };
    onUpdateAgent(updatedAgent);
  };

  const handleVerificationExpired = () => {
    // Reset current agent to null to go back to signup
    onClearCurrentAgent();
  };

  const handleBackToSignup = () => {
    // Reset current agent to null to go back to signup
    onClearCurrentAgent();
  };
  
  // If no current agent, show auth page
  if (!currentAgent) {
    return (
      <AgentAuth 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        onBack={() => window.history.back()}
      />
    );
  }

  // If agent is logged in and verified, show dashboard
  return (
    <div>
      <AgentDashboard
        agent={currentAgent}
        properties={[]} // Will be passed from parent
        leads={mockLeads}
        notifications={mockNotifications}
        onAddListing={onAddListing}
        onUpdateAgent={onUpdateAgent}
        onLogout={onClearCurrentAgent}
      />
    </div>
  );
};

export default AddListingPage;