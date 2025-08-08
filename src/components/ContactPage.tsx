import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white py-20 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/gettyimages-691802402-612x612.jpg)'
          }}
        />
        
        {/* Dark Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        
        {/* Content */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            We're here to help with all your Lagos rental needs
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-card p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send us a Message</h2>
                <p className="text-gray-600">Have questions? We'd love to hear from you.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="agent">Agent Registration</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="report">Report a Problem</option>
                    <option value="partnership">Partnership Opportunities</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
              
              {submitMessage && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                </div>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phone Support</h4>
                      <p className="text-gray-600 mb-2">+234-800-RENTALS</p>
                      <p className="text-sm text-gray-500">Mon-Fri: 8AM - 6PM WAT</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">WhatsApp Support</h4>
                      <p className="text-gray-600 mb-2">+234-812-345-6789</p>
                      <p className="text-sm text-gray-500">Quick responses, 7 days a week</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                      <p className="text-gray-600 mb-2">support@lagosrentals.ng</p>
                      <p className="text-sm text-gray-500">We reply within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg flex-shrink-0">
                      <MapPin className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Office Address</h4>
                      <p className="text-gray-600 mb-2">
                        123 Allen Avenue<br />
                        Ikeja, Lagos State<br />
                        Nigeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">Business Hours</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Monday - Friday</span>
                    <span className="font-medium text-gray-900">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Saturday</span>
                    <span className="font-medium text-gray-900">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sunday</span>
                    <span className="font-medium text-gray-900">Closed</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Emergency Support:</strong> For urgent issues, WhatsApp us anytime!
                  </p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How do I verify an agent?</h4>
                    <p className="text-sm text-gray-600">All our agents are pre-verified. Look for the verified badge on their profiles.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Is the platform free for renters?</h4>
                    <p className="text-sm text-gray-600">Yes! Searching and contacting agents is completely free for property seekers.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">How do I report suspicious listings?</h4>
                    <p className="text-sm text-gray-600">Use our contact form or WhatsApp us directly to report any concerns.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;