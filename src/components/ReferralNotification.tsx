import React from 'react';
import { Gift } from 'lucide-react';

const ReferralNotification: React.FC = () => {
  return (
    <div className="referral-notification-container mt-8">
      <div className="referral-card bg-gray-50 rounded-xl p-6 relative overflow-hidden border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow duration-300">
        {/* Background gradient accent */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
        
        {/* Content container */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Icon section */}
          <div className="flex-shrink-0">
            <div className="referral-icon-container bg-indigo-100 p-3 rounded-lg transition-transform duration-300 hover:scale-110">
              <Gift className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          {/* Text content */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-3 md:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Earn Rewards Soon!
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Referral program launching next month
                </p>
                <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">
                  Exciting news! We're launching a referral program where you can earn commissions 
                  for bringing new agents to our platform. Check back on February 1st to get your 
                  unique referral code!
                </p>
              </div>
              
              {/* Coming Soon badge */}
              <div className="flex-shrink-0">
                <div className="coming-soon-badge bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        .referral-notification-container {
          max-width: 100%;
        }
        
        .referral-card {
          background: #F5F7FA;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .referral-card:hover {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .referral-icon-container {
          background: rgba(79, 70, 229, 0.1);
        }
        
        .coming-soon-badge {
          animation: pulse 2s infinite;
          background: #4F46E5;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .referral-card {
            padding: 1.25rem;
          }
          
          .referral-icon-container {
            align-self: center;
            margin-bottom: 0.5rem;
          }
        }
        
        /* Dark mode variant (optional) */
        @media (prefers-color-scheme: dark) {
          .referral-card {
            background: #1F2937;
            color: #F9FAFB;
          }
          
          .referral-icon-container {
            background: rgba(79, 70, 229, 0.2);
          }
        }
      `}</style>
    </div>
  );
};

export default ReferralNotification;