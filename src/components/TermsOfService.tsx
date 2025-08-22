import React from 'react';
import { ArrowLeft, Shield, Users, Home, AlertTriangle, Scale, FileText } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </button>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-600">Last updated: January 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">1. Introduction</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Lagos Affordable Homes ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website and services that connect property seekers with verified rental agents in Lagos State, Nigeria. By accessing or using our platform, you agree to be bound by these Terms.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">2. Acceptance of Terms</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our services.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>You must be at least 18 years old to use our services</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the security of your account</li>
            </ul>
          </section>

          {/* Services Description */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">3. Our Services</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Lagos Affordable Homes provides a platform that:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Connects property seekers with verified rental agents</li>
              <li>Allows agents to list rental properties</li>
              <li>Facilitates direct communication between parties via WhatsApp</li>
              <li>Provides property search and filtering capabilities</li>
              <li>Offers agent verification services</li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">4. User Responsibilities</h2>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">For Property Seekers:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Always inspect properties in person before making any payments</li>
              <li>Verify agent credentials and property ownership</li>
              <li>Report suspicious listings or fraudulent activities</li>
              <li>Conduct due diligence before entering into rental agreements</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">For Agents:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide accurate and truthful property information</li>
              <li>Maintain valid verification documents</li>
              <li>Respond promptly to legitimate inquiries</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Only list properties you are authorized to rent</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">5. Prohibited Activities</h2>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users are prohibited from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Posting false, misleading, or fraudulent listings</li>
              <li>Impersonating other individuals or entities</li>
              <li>Using the platform for illegal activities</li>
              <li>Harassing, threatening, or abusing other users</li>
              <li>Attempting to circumvent our verification processes</li>
              <li>Scraping or unauthorized data collection</li>
              <li>Posting duplicate or spam listings</li>
            </ul>
          </section>

          {/* Payment and Fees */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Payment and Fees</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Property seekers can use our platform free of charge</li>
              <li>Agents receive a 30-day free trial with unlimited listings</li>
              <li>Subscription fees apply after the trial period</li>
              <li>All payments are processed through secure third-party providers</li>
              <li>Refunds are subject to our refund policy</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Disclaimers</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Important:</strong> Lagos Affordable Homes is a platform that connects parties. We are not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>A real estate agency or broker</li>
                <li>A party to any rental agreements</li>
                <li>Responsible for the condition or legality of listed properties</li>
                <li>Liable for disputes between agents and property seekers</li>
                <li>Guaranteeing the accuracy of listings or agent credentials</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Lagos Affordable Homes shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising from your use of our platform.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to terminate or suspend your account at any time for violations of these Terms or for any other reason at our sole discretion. You may also terminate your account at any time by contacting us.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these Terms from time to time. We will notify users of significant changes via email or platform notifications. Continued use of our services after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> admin@lagosrenthelp.ng</p>
              <p className="text-gray-700"><strong>Phone:</strong> +234 708 229 3054</p>
              <p className="text-gray-700"><strong>Address:</strong> Lagos State, Nigeria</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;