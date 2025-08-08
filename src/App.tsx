import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import AddListingPage from './components/AddListingPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import AgentProfile from './components/AgentProfile';
import Footer from './components/Footer';
import { mockProperties, mockAgents } from './data/mockData';
import { Property, Agent } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [agents, setAgents] = useState<Agent[]>(mockAgents);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('lagosrentals_properties');
    const savedAgents = localStorage.getItem('lagosrentals_agents');
    const savedCurrentAgent = localStorage.getItem('lagosrentals_currentAgent');
    
    if (savedProperties) {
      setProperties(JSON.parse(savedProperties));
    }
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
    if (savedCurrentAgent) {
      setCurrentAgent(JSON.parse(savedCurrentAgent));
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
      localStorage.setItem('lagosrentals_currentAgent', JSON.stringify(currentAgent));
    } else {
      localStorage.removeItem('lagosrentals_currentAgent');
    }
  }, [currentAgent]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleAgentRegister = (agentData: Omit<Agent, 'id' | 'registeredAt'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: 'agent_' + Date.now(),
      registeredAt: new Date().toISOString()
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage properties={properties} agents={agents} />;
      case 'add-listing':
        return (
          <AddListingPage
            currentAgent={currentAgent}
            onAgentRegister={handleAgentRegister}
            onAddListing={handleAddListing}
            onUpdateAgent={handleUpdateAgent}
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