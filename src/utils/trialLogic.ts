import { Agent, ClientViewCount } from '../types';

// Generate a unique client ID based on browser fingerprint
export const getClientId = (): string => {
  let clientId = localStorage.getItem('lagosrent_client_id');
  if (!clientId) {
    // Create a semi-unique ID based on browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');
    
    clientId = 'client_' + btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16) + '_' + Date.now();
    localStorage.setItem('lagosrent_client_id', clientId);
  }
  return clientId;
};

// Check if agent's trial has expired
export const isTrialExpired = (agent: Agent): boolean => {
  return new Date() > new Date(agent.trialExpiresAt);
};

// Check if agent is in active trial
export const isInTrial = (agent: Agent): boolean => {
  return agent.status === 'trial' && !isTrialExpired(agent);
};

// Check if client can view agent contact (max 2 views per agent)
export const canViewAgentContact = (
  clientId: string, 
  agentId: string, 
  viewCounts: ClientViewCount[]
): boolean => {
  const clientViews = viewCounts.find(
    vc => vc.clientId === clientId && vc.agentId === agentId
  );
  
  return !clientViews || clientViews.count < 2;
};

// Record a client view of agent contact
export const recordClientView = (
  clientId: string,
  agentId: string,
  viewCounts: ClientViewCount[]
): ClientViewCount[] => {
  const existingIndex = viewCounts.findIndex(
    vc => vc.clientId === clientId && vc.agentId === agentId
  );
  
  const newViewCounts = [...viewCounts];
  
  if (existingIndex >= 0) {
    newViewCounts[existingIndex] = {
      ...newViewCounts[existingIndex],
      count: newViewCounts[existingIndex].count + 1,
      lastViewedAt: new Date().toISOString()
    };
  } else {
    newViewCounts.push({
      clientId,
      agentId,
      count: 1,
      lastViewedAt: new Date().toISOString()
    });
  }
  
  return newViewCounts;
};

// Send WhatsApp notification to agent (simulated)
export const sendWhatsAppNotification = (agent: Agent): void => {
  const message = `Hello ${agent.name}, clients are trying to reach you on LagosRentHelp but your free trial has limited visibility. Upgrade now to unlock full access. Visit your dashboard to upgrade.`;
  
  // In a real app, this would integrate with WhatsApp Business API
  console.log(`WhatsApp notification sent to ${agent.whatsappNumber}:`, message);
  
  // For demo purposes, show an alert
  setTimeout(() => {
    alert(`WhatsApp Notification Sent to ${agent.name}:\n\n${message}`);
  }, 1000);
};

// Check if agent needs upgrade notification
export const shouldSendUpgradeNotification = (
  agentId: string,
  viewCounts: ClientViewCount[]
): boolean => {
  const agentViews = viewCounts.filter(vc => vc.agentId === agentId);
  const uniqueClients = new Set(agentViews.map(vc => vc.clientId));
  
  // Send notification if 2 or more unique clients have hit the limit
  return Array.from(uniqueClients).some(clientId => {
    const clientViews = viewCounts.find(vc => vc.clientId === clientId && vc.agentId === agentId);
    return clientViews && clientViews.count >= 2;
  });
};

// Update agent status based on trial expiry
export const updateAgentStatus = (agent: Agent): Agent => {
  if (agent.status === 'trial' && isTrialExpired(agent)) {
    return {
      ...agent,
      status: 'trial_expired'
    };
  }
  return agent;
};

// Calculate days remaining in trial
export const getDaysRemainingInTrial = (agent: Agent): number => {
  if (agent.status !== 'trial') return 0;
  
  const now = new Date();
  const trialEnd = new Date(agent.trialExpiresAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};