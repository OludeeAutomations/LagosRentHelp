import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AddListingPage from './components/AddListingPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AgentProfile from './components/AgentProfile';
import Footer from './components/Footer';
import { mockProperties, mockAgents } from './data/mockData';
import { Property, Agent, ClientViewCount } from './types';
import { updateAgentStatus } from './utils/trialLogic';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);
  const [clientViewCounts, setClientViewCounts] = useState<ClientViewCount[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('lagosrentals_properties');
    const savedAgents = localStorage.getItem('lagosrentals_agents');
    const savedCurrentAgent = localStorage.getItem('lagosrentals_currentAgent');
    const savedViewCounts = localStorage.getItem('lagosrentals_viewCounts');
    
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
    if (savedAgents) {
      const loadedAgents = JSON.parse(savedAgents);
      // Update agent statuses based on trial expiry
      const updatedAgents = loadedAgents.map(updateAgentStatus);
      setAgents(updatedAgents);
    }
    if (savedCurrentAgent) {
      const loadedAgent = JSON.parse(savedCurrentAgent);
      setCurrentAgent(updateAgentStatus(loadedAgent));
    }
    if (savedViewCounts) {
      setClientViewCounts(JSON.parse(savedViewCounts));
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('lagosrentals_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('lagosrentals_agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    if (currentAgent) {
      const updatedAgent = updateAgentStatus(currentAgent);
      localStorage.setItem('lagosrentals_currentAgent', JSON.stringify(updatedAgent));
      if (updatedAgent.status !== currentAgent.status) {
        setCurrentAgent(updatedAgent);
      }
    } else {
      localStorage.removeItem('lagosrentals_currentAgent');
    }
  }, [currentAgent]);

  useEffect(() => {
    localStorage.setItem('lagosrentals_viewCounts', JSON.stringify(clientViewCounts));
  }, [clientViewCounts]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAgentRegister = (agentData: Omit<Agent, 'id' | 'registeredAt'>) => {
    const now = new Date();
    const trialExpiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    const newAgent: Agent = {
      ...agentData,
      id: 'agent_' + Date.now(),
      registeredAt: now.toISOString(),
      status: 'trial',
      trialExpiresAt: trialExpiry.toISOString()
    };
    
    setAgents(prev => [...prev, newAgent]);
    setCurrentAgent(newAgent);
  };

  const handleAddListing = (listingData: Omit<Property, 'id' | 'createdAt'>) => {
    const newListing: Property = {
      ...listingData,
      id: 'prop_' + Date.now(),
      createdAt: new Date().toISOString()
    };
    
    setProperties(prev => [...prev, newListing]);
  };

  const handleUpdateAgent = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    ));
    if (currentAgent?.id === updatedAgent.id) {
      setCurrentAgent(updatedAgent);
    }
  };

  const handleClearCurrentAgent = () => {
    setCurrentAgent(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage properties={properties} agents={agents} clientViewCounts={clientViewCounts} onUpdateViewCounts={setClientViewCounts} onNavigate={handleNavigate} />;
      case 'add-listing':
        return (
          <AddListingPage
            currentAgent={currentAgent}
            onAgentRegister={handleAgentRegister}
            onAddListing={handleAddListing}
            onUpdateAgent={handleUpdateAgent}
            onClearCurrentAgent={handleClearCurrentAgent}
          />
        );
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'profile':
        return currentAgent ? (
          <AgentProfile
            agent={currentAgent}
            properties={properties}
            allAgents={agents}
          />
        ) : (
          <HomePage properties={properties} agents={agents} />
        );
      default:
        return <HomePage properties={properties} agents={agents} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentAgent={currentAgent}
      />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;