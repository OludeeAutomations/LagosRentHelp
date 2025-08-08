import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Plus, 
  Users, 
  Link, 
  Eye, 
  Bell, 
  Gift, 
  TrendingUp, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Menu,
  X,
  Settings,
  LogOut,
  Camera,
  Upload,
  MoreHorizontal,
  Filter,
  Search
} from 'lucide-react';
import { Agent, Property, Lead, Notification } from '../types';
import PropertyCard from './PropertyCard';

interface AgentDashboardProps {
  agent: Agent;
  properties: Property[];
  leads: Lead[];
  notifications: Notification[];
  onAddListing: (listing: Omit<Property, 'id' | 'createdAt'>) => void;
  onUpdateAgent: (agent: Agent) => void;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({
  agent,
  properties,
  leads,
  notifications,
  onAddListing,
  onUpdateAgent
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddListing, setShowAddListing] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [listingForm, setListingForm] = useState({
    title: '',
    propertyType: 'Single Room',
    location: '',
    price: '',
    description: '',
    photos: [] as string[],
    imageFiles: [] as File[]
  });

  const agentProperties = properties.filter(p => p.agentId === agent.id);
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const referralUrl = `${window.location.origin}?ref=${agent.referralCode}`;

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newListing = {
      ...listingForm,
      price: parseInt(listingForm.price),
      agentId: agent.id,
      photos: listingForm.photos.length > 0 ? listingForm.photos : listingForm.imageFiles.length > 0 ? 
        listingForm.imageFiles.map(file => URL.createObjectURL(file)) : [
        'https://images.pexels.com/photos/1643389/pexels-photo-1643389.jpeg?auto=compress&cs=tinysrgb&w=800'
      ]
    };
    
    onAddListing(newListing);
    
    // Reset form
    setListingForm({
      title: '',
      propertyType: 'Single Room',
      location: '',
      price: '',
      description: '',
      photos: [],
      imageFiles: []
    });
    
    setShowAddListing(false);
    setIsMobileMenuOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const selectedFiles = files.slice(0, 5);
      setListingForm(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...selectedFiles].slice(0, 5)
      }));
    }
  };

  const removeImage = (index: number) => {
    setListingForm(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const getDaysRemainingInTrial = () => {
    const now = new Date();
    const trialEnd = new Date(agent.trialExpiresAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getLeadStats = () => {
    const agentLeads = leads.filter(l => l.agentId === agent.id);
    return {
      totalViews: agentLeads.filter(l => l.type === 'listing_view').length,
      totalClicks: agentLeads.filter(l => l.type === 'contact_click').length,
      referralClicks: agentLeads.filter(l => l.type === 'referral_click').length
    };
  };

  const leadStats = getLeadStats();

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'listings', label: 'Properties', icon: MapPin },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'leads', label: 'Analytics', icon: TrendingUp }
  ];

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 text-sm">
              {agent.name.split(' ')[0]}
            </h1>
            <p className="text-xs text-gray-500">
              {agent.status === 'trial' ? `${getDaysRemainingInTrial()}d trial` : 'Active'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadNotifications.length > 0 && (
            <div className="relative">
              <button className="p-2 hover:bg-gray-50 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadNotifications.length}
                </div>
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-gray-50 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile Menu Component
  const MobileMenu = () => (
    <div className={`lg:hidden fixed inset-0 z-50 transform transition-transform duration-300 ${
      isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
      
      <div className="absolute right-0 top-0 h-full w-80 max-w-sm bg-white shadow-xl">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
          
          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setShowAddListing(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add Property</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-screen fixed top-16 left-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{agent.name}</h2>
            <p className="text-sm text-gray-500">
              {agent.status === 'trial' ? `Trial: ${getDaysRemainingInTrial()} days` : 'Active Plan'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
        
        <div className="pt-4">
          <button
            onClick={() => setShowAddListing(true)}
            className="w-full flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Property</span>
          </button>
        </div>
      </div>
      
      {unreadNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {unreadNotifications.length} notification{unreadNotifications.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Properties</p>
            <p className="text-2xl font-bold text-gray-900">{agentProperties.length}</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Views</p>
            <p className="text-2xl font-bold text-gray-900">{leadStats.totalViews}</p>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Eye className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Referrals</p>
            <p className="text-2xl font-bold text-gray-900">{agent.referralCount}</p>
          </div>
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Free Credits</p>
            <p className="text-2xl font-bold text-gray-900">{agent.freeListingsFromReferrals}</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Gift className="h-5 w-5 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // Overview Tab Content
  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Welcome back, {agent.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-gray-600">
              {agent.status === 'trial' 
                ? `Your free trial expires in ${getDaysRemainingInTrial()} days`
                : 'Your account is active and ready to go'
              }
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{agentProperties.length}</div>
              <div className="text-sm text-gray-500">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{leadStats.totalViews}</div>
              <div className="text-sm text-gray-500">Views</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCards />

      {/* Quick Actions & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowAddListing(true)}
              className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="font-medium">Add New Property</span>
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Link className="h-5 w-5" />
              <span className="font-medium">Share Referral Link</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {leads.filter(l => l.agentId === agent.id).length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads
                .filter(l => l.agentId === agent.id)
                .slice(0, 3)
                .map(lead => (
                  <div key={lead.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      lead.type === 'listing_view' ? 'bg-blue-100' :
                      lead.type === 'contact_click' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {lead.type === 'listing_view' ? (
                        <Eye className="h-4 w-4 text-blue-600" />
                      ) : lead.type === 'contact_click' ? (
                        <Phone className="h-4 w-4 text-green-600" />
                      ) : (
                        <Link className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {lead.type === 'listing_view' ? 'Property Viewed' :
                         lead.type === 'contact_click' ? 'Contact Clicked' : 'Referral Click'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Listings Tab Content
  const ListingsContent = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
          <p className="text-gray-600">{agentProperties.length} active listings</p>
        </div>
        <button
          onClick={() => setShowAddListing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Property</span>
        </button>
      </div>

      {showAddListing && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Add New Property</h3>
            <button
              onClick={() => setShowAddListing(false)}
              className="p-2 hover:bg-gray-50 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleAddListing} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
                <input
                  type="text"
                  required
                  value={listingForm.title}
                  onChange={(e) => setListingForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Modern Self-Contain Apartment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  required
                  value={listingForm.propertyType}
                  onChange={(e) => setListingForm(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Single Room">Single Room</option>
                  <option value="Self-Contain">Self-Contain</option>
                  <option value="Mini Flat">Mini Flat</option>
                  <option value="One Bedroom">One Bedroom</option>
                  <option value="Two Bedroom">Two Bedroom</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  required
                  value={listingForm.location}
                  onChange={(e) => setListingForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lekki Phase 1, Lagos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Rent (₦)</label>
                <input
                  type="number"
                  required
                  value={listingForm.price}
                  onChange={(e) => setListingForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="350000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                rows={4}
                value={listingForm.description}
                onChange={(e) => setListingForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the property features, amenities, and nearby facilities..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images (Max 5)
              </label>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Click to upload images</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5 files</span>
                  </label>
                </div>
                
                {listingForm.imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {listingForm.imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Property image ${index + 1}`}
                          className="w-full h-24 lg:h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4 pt-4">
              <button 
                type="submit" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Publish Listing
              </button>
              <button
                type="button"
                onClick={() => setShowAddListing(false)}
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {agentProperties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Home className="h-8 w-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No properties yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first property listing</p>
          <button
            onClick={() => setShowAddListing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {agentProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              agent={agent}
              clientViewCounts={[]}
              onUpdateViewCounts={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );

  // Referrals Tab Content
  const ReferralsContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Program</h2>
          <p className="text-gray-600 mb-8">
            Invite other agents and earn free listings for every successful referral!
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900">{agent.referralCount}</div>
              <div className="text-gray-600">Total Referrals</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900">{agent.freeListingsFromReferrals}</div>
              <div className="text-gray-600">Free Listings</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-3xl font-bold text-gray-900">{leadStats.referralClicks}</div>
              <div className="text-gray-600">Link Clicks</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
          <Link className="h-5 w-5 mr-2" />
          Your Referral Link
        </h3>
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-transparent text-gray-700 text-sm truncate"
          />
          <button
            onClick={handleCopyReferralLink}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {copiedReferral ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Share your unique referral link with other agents</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>When they sign up using your link, you earn 1 free listing</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Free listings can be used anytime, even after your trial expires</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>No limit on referrals - invite as many agents as you want!</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Analytics Tab Content
  const AnalyticsContent = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h2>
        <p className="text-gray-600">Track your property performance and engagement</p>
      </div>
      
      <StatsCards />

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
        {leads.filter(l => l.agentId === agent.id).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-gray-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No activity yet</h4>
            <p className="text-gray-500">Start promoting your listings to see analytics here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads
              .filter(l => l.agentId === agent.id)
              .slice(0, 10)
              .map(lead => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      lead.type === 'listing_view' ? 'bg-blue-100' :
                      lead.type === 'contact_click' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {lead.type === 'listing_view' ? (
                        <Eye className="h-5 w-5 text-blue-600" />
                      ) : lead.type === 'contact_click' ? (
                        <Phone className="h-5 w-5 text-green-600" />
                      ) : (
                        <Link className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {lead.type === 'listing_view' ? 'Property Viewed' :
                         lead.type === 'contact_click' ? 'Contact Clicked' : 'Referral Link Clicked'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  // Referral Bottom Section Component
  const ReferralBottomSection = () => (
    <div className="mt-8">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
            <defs>
              <pattern id="referral-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#referral-pattern)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-bold mb-2">
              Earn Free Listings with Referrals
            </h3>
            <p className="text-emerald-100 mb-4 text-sm lg:text-base">
              Share your referral code and earn 1 free listing for every agent who joins using your link
            </p>
            
            {/* Referral Code Display */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-emerald-100 font-medium">Your Code:</span>
                  <span className="font-mono font-bold text-white tracking-wider">
                    {agent.referralCode}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleCopyReferralLink}
                className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                {copiedReferral ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Referral Icon/Illustration */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Main Gift Box */}
              <div className="w-20 h-16 lg:w-24 lg:h-20 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-center relative">
                <Gift className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                
                {/* Floating Elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <span className="text-xs font-bold text-yellow-900">₦</span>
                </div>
                
                <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
              
              {/* Success Indicator */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg lg:text-xl font-bold text-white">{agent.referralCount}</div>
              <div className="text-xs text-emerald-100">Referrals</div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-white">{agent.freeListingsFromReferrals}</div>
              <div className="text-xs text-emerald-100">Free Credits</div>
            </div>
            <div>
              <div className="text-lg lg:text-xl font-bold text-white">{leadStats.referralClicks}</div>
              <div className="text-xs text-emerald-100">Link Clicks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <MobileHeader />
      <MobileMenu />
      
      <div className="flex pt-16 lg:pt-0">
        <div className="hidden lg:block w-64"></div>
        <DesktopSidebar />
        
        <div className="flex-1 p-4 lg:p-6 lg:pt-8 bg-slate-50 lg:ml-0">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'listings' && <ListingsContent />}
          {activeTab === 'referrals' && <ReferralsContent />}
          {activeTab === 'leads' && <AnalyticsContent />}
          
          {/* Referral Bottom Section - Show on all tabs */}
          <ReferralBottomSection />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;