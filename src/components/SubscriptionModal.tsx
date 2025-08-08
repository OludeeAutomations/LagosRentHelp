import React from 'react';
import { X, Crown, Star, Check } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: (plan: SubscriptionPlan) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe }) => {
  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 3000,
      listings: 5,
      duration: '1 month'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 6000,
      listings: 10,
      duration: '1 month'
    }
  ];

  const handlePayment = (plan: SubscriptionPlan) => {
    // In a real app, integrate with Paystack or Flutterwave
    alert(`Payment integration coming soon!\n\nPlan: ${plan.name}\nPrice: ₦${plan.price.toLocaleString()}\n\nFor demo purposes, subscription activated!`);
    onSubscribe(plan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              🎉 You've reached your 2 free listings!
            </h3>
            <p className="text-gray-600">
              Please subscribe to continue adding more properties
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-2xl p-6 relative ${
                  plan.id === 'premium' 
                    ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.id === 'premium' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                      <Star className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900">₦{plan.price.toLocaleString()}</span>
                    <span className="text-gray-600">/{plan.duration}</span>
                  </div>
                  <p className="text-gray-600">{plan.listings} listing slots per month</p>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">{plan.listings} property listings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">WhatsApp integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Professional profile page</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Photo upload (5 per listing)</span>
                  </div>
                  {plan.id === 'premium' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">Priority listing placement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">Featured badge</span>
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => handlePayment(plan)}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    plan.id === 'premium'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg hover:shadow-xl'
                      : 'btn-primary'
                  }`}
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 text-xl">💳</div>
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Payment Options</p>
                <p className="text-sm text-blue-700">
                  We accept payments via Paystack and Flutterwave. All transactions are secure and encrypted.
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Note:</strong> This is a demo. Actual payment integration will be implemented in production.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;